import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  getDocFromServer,
  query, 
  where, 
  deleteDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const firebaseService = {
  // Users
  async syncUserProfile(user: any) {
    if (!user || !user.email) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const data: any = {
        uid: user.uid,
        email: user.email.toLowerCase(),
        display_name: user.displayName || '',
        photo_url: user.photoURL || '',
        last_login: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error('[Firebase] Error syncing user profile:', error);
    }
  },

  async getUserProfile(uid: string) {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
       handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  },

  async updateUserProfile(uid: string, data: any) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, data, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  },

  async getAllUsers() {
    try {
      const [usersSnap, subsSnap, plans] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'subscriptions')),
        this.getPlans()
      ]);

      const subsMap: Record<string, any> = {};
      subsSnap.docs.forEach(doc => {
        const data = doc.data();
        subsMap[data.user_email?.toLowerCase()] = { id: doc.id, ...data };
      });

      return usersSnap.docs.map(doc => {
        const userData = doc.data();
        const email = userData.email?.toLowerCase();
        const sub = subsMap[email];
        const plan = plans?.find(p => p.id === sub?.plan_id);

        return {
          ...userData,
          subscription: sub || { plan_id: 'none', status: 'inactive' },
          plan_name: plan?.name || 'Aucun Plan',
          site_limit: plan?.site_limit || plan?.sites || 0
        };
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  // Plans
  async getPlans() {
    try {
      const snapshot = await getDocs(collection(db, 'plans'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
    } catch (error) {
      console.error('[Firebase] Error getting plans:', error);
      return [];
    }
  },

  async getAddons() {
    try {
      const snapshot = await getDocs(collection(db, 'addons'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
    } catch (error) {
      console.error('[Firebase] Error getting addons:', error);
      return [];
    }
  },

  async purchaseAddon(email: string, addonId: string, transactionId: string, amount: number) {
    try {
      const purchaseRef = doc(collection(db, 'addon_purchases'));
      await setDoc(purchaseRef, {
        user_email: email.toLowerCase(),
        addon_id: addonId,
        transaction_id: transactionId,
        amount: amount,
        created_at: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'addon_purchases');
    }
  },

  // Subscriptions
  async getSubscription(email: string) {
    if (!email || email === 'admin') {
      return { plan_id: 'none', site_limit: 0, status: 'inactive' };
    }
    const cleanEmail = email.toLowerCase();
    try {
      let subData: any = null;
      
      // 1. Try fetching by UID if it's the current user
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email?.toLowerCase() === cleanEmail) {
        const docSnap = await getDoc(doc(db, 'subscriptions', currentUser.uid));
        if (docSnap.exists()) {
          subData = { id: docSnap.id, ...docSnap.data() };
        }
      }

      // 2. Fallback to query by email
      if (!subData) {
        const q = query(collection(db, 'subscriptions'), where('user_email', '==', cleanEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          subData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
      }

      if (!subData) return { plan_id: 'none', site_limit: 0, status: 'inactive' };

      // 3. Attach plan details (limit)
      const plans = await this.getPlans();
      const plan = plans?.find(p => p.id === subData.plan_id);
      return { 
        ...subData, 
        site_limit: plan?.site_limit || plan?.sites || 0,
        plan_name: plan?.name || 'Inconnu'
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `subscriptions/${cleanEmail}`);
    }
  },

  async subscribe(email: string, planId: string, transactionId?: string, amount?: number) {
    try {
      const cleanEmail = email.toLowerCase();
      const currentUser = auth.currentUser;
      
      // 1. Determine the best document ID
      // If we are logged in as the target email, use that UID primarily.
      let docId = (currentUser && currentUser.email?.toLowerCase() === cleanEmail) 
        ? currentUser.uid 
        : null;

      if (!docId) {
        // Look up if a user exists with this email to get their UID
        const userQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const userSnap = await getDocs(userQ);
        if (!userSnap.empty) {
          docId = userSnap.docs[0].id;
        } else {
          // Fallback to email slug ONLY if no user found
          docId = cleanEmail.replace(/[@.]/g, '_');
        }
      }

      const subRef = doc(db, 'subscriptions', docId);
      const expiresAt = new Date();
      
      // Get trial duration from plan if it's a trial
      if (planId === 'trial') {
        const plans = await this.getPlans();
        const trialPlan = plans.find(p => p.id === 'trial');
        const durationHours = trialPlan?.duration_hours || 1;
        expiresAt.setTime(expiresAt.getTime() + (durationHours * 60 * 60 * 1000));
      } else {
        expiresAt.setDate(expiresAt.getDate() + 30);
      }

      const data = {
        user_email: cleanEmail,
        plan_id: planId,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        created_at: serverTimestamp()
      };

      await setDoc(subRef, data, { merge: true });

      if (amount && amount > 0) {
        const paymentRef = doc(collection(db, 'payments'));
        await setDoc(paymentRef, {
          id: paymentRef.id,
          user_email: cleanEmail,
          plan_id: planId,
          amount: amount,
          transaction_id: transactionId || 'internal',
          created_at: serverTimestamp()
        });
      }
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'subscriptions');
    }
  },

  // Sites
  async getSites(email: string) {
    try {
      const q = query(collection(db, 'sites'), where('user_email', '==', email));
      const snapshot = await getDocs(q);
      const allSites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Deduplicate by normalized URL
      const uniqueSites: any[] = [];
      const seenUrls = new Set();
      const duplicatesToDelete: string[] = [];

      allSites.forEach((site: any) => {
        const norm = this.normalizeUrl(site.url);
        if (seenUrls.has(norm)) {
          duplicatesToDelete.push(site.id);
        } else {
          seenUrls.add(norm);
          uniqueSites.push(site);
        }
      });

      // Async cleanup (don't wait)
      if (duplicatesToDelete.length > 0) {
        console.warn(`[Firebase] Cleaning up ${duplicatesToDelete.length} duplicate sites for ${email}`);
        duplicatesToDelete.forEach(id => {
          deleteDoc(doc(db, 'sites', id)).catch(e => console.error('Failed to cleanup duplicate', e));
        });
      }

      return uniqueSites;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'sites');
    }
  },

  normalizeUrl(url: string) {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
  },

  async getSiteOwner(url: string) {
    try {
      const normalized = this.normalizeUrl(url);
      const docSnap = await getDocFromServer(doc(db, 'site_registry', normalized));
      if (docSnap.exists()) {
        return docSnap.data().user_email;
      }
      return null;
    } catch (error) {
      console.error('[Firebase] Error getting site owner from registry:', error);
      return null;
    }
  },

  async isSiteRegistered(url: string, currentEmail?: string) {
    try {
      const normalized = this.normalizeUrl(url);
      const docSnap = await getDocFromServer(doc(db, 'site_registry', normalized));
      
      if (!docSnap.exists()) return false;

      // If it exists, it's ONLY registered if the owner is DIFFERENT from current user
      const ownerEmail = docSnap.data().user_email;
      if (currentEmail && ownerEmail === currentEmail) {
        return false; // Not "already registered" by someone else, so user can re-add it
      }
      
      return true; // Already registered by someone else
    } catch (error) {
      console.error('[Firebase] Error checking site registry:', error);
      return false;
    }
  },

  async saveSite(siteData: any) {
    try {
      const normalized = this.normalizeUrl(siteData.url);
      const currentEmail = siteData.user_email?.toLowerCase();
      
      // 1. Logic for NEW site or check global restriction
      const isAlreadyTaken = await this.isSiteRegistered(siteData.url, currentEmail);
      if (isAlreadyTaken) {
        throw new Error('SITE_ALREADY_REGISTERED');
      }

      const siteId = siteData.id || crypto.randomUUID();
      const siteRef = doc(db, 'sites', siteId);
      const data = {
        ...siteData,
        normalized_url: normalized,
        created_at: siteData.created_at || serverTimestamp()
      };

      await setDoc(siteRef, data, { merge: true });

      // Always ensure registry matches for the final URL
      await setDoc(doc(db, 'site_registry', normalized), {
        user_email: siteData.user_email,
        site_id: siteId,
        created_at: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message === 'SITE_ALREADY_REGISTERED') {
        throw error;
      }
      handleFirestoreError(error, OperationType.WRITE, 'sites');
    }
  },

  async deleteSite(siteId: string, url?: string) {
    try {
      // NEVER DELETE from registry. 
      // Once a site is linked to an account, it stays linked forever in site_registry.
      // This prevents users from moving sites to new accounts for free trials.
      
      await deleteDoc(doc(db, 'sites', siteId));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sites/${siteId}`);
    }
  },

  async syncAllSitesToRegistry(email: string) {
    try {
      const q = query(collection(db, 'sites'), where('user_email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      for (const siteDoc of querySnapshot.docs) {
        const data = siteDoc.data();
        const normalized = this.normalizeUrl(data.url);
        
        // Ensure registry entry exists
        await setDoc(doc(db, 'site_registry', normalized), {
          site_id: siteDoc.id,
          user_email: email.toLowerCase(),
          url: normalized,
          registered_at: data.created_at || serverTimestamp()
        }, { merge: true });
      }
      return { success: true, count: querySnapshot.size };
    } catch (error) {
      console.error('[Firebase] Error syncing registry:', error);
      return { success: false, error };
    }
  },

  // Translations
  async getTranslations(lang: string) {
    try {
      const q = query(collection(db, 'translations'), where('lang', '==', lang));
      const snapshot = await getDocs(q);
      const transMap: Record<string, string> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        transMap[data.key] = data.value;
      });
      return transMap;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'translations');
    }
  },

  // Admin Methods
  async getAllSubscribers() {
    try {
      const snapshot = await getDocs(collection(db, 'subscriptions'));
      const plans = await this.getPlans();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const plan = plans?.find(p => p.id === data.plan_id);
        return { 
          ...data, 
          id: doc.id, 
          plan_name: plan?.name || 'Inconnu' 
        };
      }) || [];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'subscriptions');
    }
  },

  async getAllPayments() {
    try {
      const snapshot = await getDocs(query(collection(db, 'payments'), orderBy('created_at', 'desc')));
      const plans = await this.getPlans();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const plan = plans?.find(p => p.id === data.plan_id);
        return { 
          ...data, 
          id: doc.id, 
          plan_name: plan?.name || 'Inconnu',
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at
        };
      }) || [];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'payments');
    }
  },

  async getAllTranslations() {
    try {
      const snapshot = await getDocs(collection(db, 'translations'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
    } catch (error) {
      console.error('[Firebase] Error getting all translations:', error);
      return [];
    }
  },

  async updatePlan(id: string, data: any) {
    try {
      await setDoc(doc(db, 'plans', id), data, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `plans/${id}`);
    }
  },

  async deletePlan(id: string) {
    try {
      await deleteDoc(doc(db, 'plans', id));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `plans/${id}`);
    }
  },

  async updateSetting(key: string, value: string) {
    if (!auth.currentUser) {
      console.warn('[Firebase] Warning: updateSetting called without active session');
    }
    try {
      await setDoc(doc(db, 'settings', key), { key, value }, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/${key}`);
    }
  },

  async updateTranslation(key: string, lang: string, value: string) {
    const id = `${key}_${lang}`;
    try {
      await setDoc(doc(db, 'translations', id), { key, lang, value, updated_at: serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `translations/${id}`);
    }
  },

  async deleteTranslation(key: string, lang: string) {
    const id = `${key}_${lang}`;
    try {
      await deleteDoc(doc(db, 'translations', id));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `translations/${id}`);
    }
  },

  async getSettings() {
    try {
      const snapshot = await getDocs(collection(db, 'settings'));
      const settingsMap: Record<string, string> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        settingsMap[data.key] = data.value;
      });
      return settingsMap;
    } catch (error) {
      console.error('[Firebase] Error getting settings:', error);
      return {};
    }
  },

  async getPaypalClientId() {
    const settings = await this.getSettings();
    return settings['paypal_client_id'] || '';
  },

  async updatePaypalClientId(clientId: string) {
    return this.updateSetting('paypal_client_id', clientId);
  },

  async giveFreePack(email: string, planId: string, days: number = 30) {
    try {
      const cleanEmail = email.toLowerCase();
      // Find user by email to get their real UID
      let userUid = cleanEmail.replace(/[@.]/g, '_');
      
      const userQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        userUid = userSnap.docs[0].id;
      } else {
        // Try subscriptions as fallback for old data
        const subQ = query(collection(db, 'subscriptions'), where('user_email', '==', cleanEmail));
        const subSnap = await getDocs(subQ);
        if (!subSnap.empty) {
          userUid = subSnap.docs[0].id;
        }
      }

      const subRef = doc(db, 'subscriptions', userUid);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const data = {
        user_email: cleanEmail,
        plan_id: planId,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        is_free: true,
        offered_by: 'admin',
        updated_at: serverTimestamp()
      };

      await setDoc(subRef, data, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `subscriptions/free/${email}`);
    }
  },

  async sendOffer(email: string, offerTitle: string, offerContent: string) {
    try {
      const offerRef = doc(collection(db, 'user_offers'));
      await setDoc(offerRef, {
        user_email: email,
        title: offerTitle,
        content: offerContent,
        status: 'unread',
        created_at: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, 'user_offers');
    }
  },

  async getUserOffers(email: string) {
    try {
      const q = query(
        collection(db, 'user_offers'), 
        where('user_email', '==', email)
      );
      const snapshot = await getDocs(q);
      const offers = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        created_at: (doc.data() as any).created_at?.toDate?.()?.toISOString() || (doc.data() as any).created_at
      }));
      // Sort locally to avoid index requirement
      return offers.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('[Firebase] Error getting user offers:', error);
      return [];
    }
  },

  // Messages / Inbox
  async getInboxMessages(email: string) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('recipient_email', '==', email.toLowerCase()),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        created_at: (doc.data() as any).created_at?.toDate?.()?.toISOString() || (doc.data() as any).created_at
      }));
    } catch (error) {
      console.error('[Firebase] Error getting inbox messages:', error);
      return [];
    }
  },

  async markMessageRead(messageId: string) {
    try {
      await setDoc(doc(db, 'messages', messageId), { status: 'read' }, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `messages/${messageId}`);
    }
  },

  async archiveMessage(messageId: string, collectionName: string = 'messages') {
    try {
      await setDoc(doc(db, collectionName, messageId), { status: 'archived' }, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${messageId}`);
    }
  },

  async deleteMessage(messageId: string, collectionName: string = 'messages') {
    try {
      await deleteDoc(doc(db, collectionName, messageId));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${messageId}`);
    }
  },

  // Support Tickets API
  async createSupportTicket(ticket: any) {
    try {
      const ticketId = 'ticket_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const ticketRef = doc(db, 'support_tickets', ticketId);
      const payload = {
        ...ticket,
        id: ticketId,
        created_at: new Date().toISOString(),
        status: 'new'
      };
      await setDoc(ticketRef, payload);
      return payload;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `support_tickets`);
    }
  },

  async getUserSupportTickets(email: string) {
    try {
      const q = query(
        collection(db, 'support_tickets'),
        where('user_email', '==', email.toLowerCase())
      );
      const snapshot = await getDocs(q);
      const tickets: any[] = [];
      snapshot.forEach(docSnap => {
        tickets.push(docSnap.data());
      });
      // Sort in JS to avoid index requirement for multiple fields, or simple creation sorting
      tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return tickets;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'support_tickets');
    }
  },

  async getAllSupportTickets() {
    try {
      const snapshot = await getDocs(collection(db, 'support_tickets'));
      const tickets: any[] = [];
      snapshot.forEach(docSnap => {
        tickets.push(docSnap.data());
      });
      tickets.sort((a, b) => {
        // Sort active/new tickets first, then by date desc
        if (a.status === 'new' && b.status !== 'new') return -1;
        if (a.status !== 'new' && b.status === 'new') return 1;
        if (a.status === 'processing' && b.status === 'resolved') return -1;
        if (a.status === 'resolved' && b.status !== 'resolved') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return tickets;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'support_tickets');
    }
  },

  async replyToSupportTicket(ticketId: string, adminReply: string, status: 'processing' | 'resolved') {
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      const updates = {
        admin_reply: adminReply,
        status,
        updated_at: new Date().toISOString()
      };
      await setDoc(ticketRef, updates, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `support_tickets/${ticketId}`);
    }
  }
};
