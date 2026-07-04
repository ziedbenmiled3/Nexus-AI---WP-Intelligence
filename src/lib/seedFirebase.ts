import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const DEFAULT_PLANS = [
  { id: 'trial', name: 'Test Vision', price: 0, site_limit: 1, duration_hours: 24, description: 'Testez toutes les fonctionnalités pendant 24 heures gratuitement' },
  { id: 'starter', name: 'Starter Protocol', price: 29, site_limit: 1, description: 'Gestion d\'un seul site WordPress' },
  { id: 'pro', name: 'Pro Nexus', price: 79, site_limit: 5, description: 'Gestion jusqu\'à 5 sites WordPress' },
  { id: 'elite', name: 'Elite Vision', price: 199, site_limit: 12, description: 'Gestion jusqu\'à 12 sites WordPress' }
];

export async function seedFirebaseDefaults(user?: any, force = false) {
  try {
    const adminEmail = 'contact@nexuswp.pro';
    const effectiveUser = user || auth.currentUser;
    
    console.log('[Firebase] Seeding started...', { force });

    // 1. Validate if we can seed (force requires admin email or being authenticated)
    if (!effectiveUser) {
        console.warn('[Firebase] Seed aborted: No user authenticated.');
        return false;
    }

    console.log('[Firebase] User for seeding:', { 
      uid: effectiveUser.uid, 
      email: effectiveUser.email,
      isMaster: effectiveUser.email?.toLowerCase() === adminEmail.toLowerCase()
    });

    if (force && effectiveUser.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        console.error('[Firebase] Force seed rejected: Not SuperAdmin');
        throw new Error('Permission denied: SuperAdmin only');
    }

    // 2. Plans
    console.log('[Firebase] Checking plans...');
    const plansSnap = await getDocs(collection(db, 'plans'));
    if (plansSnap.empty || force) {
      console.log(`[Firebase] Initializing plans (force=${force})...`);
      const batch = writeBatch(db);
      
      // Clear existing if force
      if (force && !plansSnap.empty) {
        plansSnap.docs.forEach(d => batch.delete(d.ref));
      }
      
      DEFAULT_PLANS.forEach(plan => {
        batch.set(doc(db, 'plans', plan.id), plan);
      });
      
      await batch.commit();
      console.log('[Firebase] Plans seeded.');
    }

    // 4. Admin Bootstrap (Only if superadmin)
    const currentEmail = effectiveUser?.email?.toLowerCase() || '';
    if (currentEmail === adminEmail.toLowerCase()) {
      try {
        console.log('[Firebase] Attempting to update SuperAdmin record...');
        await setDoc(doc(db, 'admins', effectiveUser.uid), {
          email: currentEmail,
          role: 'admin',
          updated_at: new Date().toISOString()
        }, { merge: true });
        console.log('[Firebase] SuperAdmin record updated.');
      } catch (adminErr: any) {
        console.warn('[Firebase] Warning: Admin bootstrap failed:', adminErr.message);
        // Don't throw if just the admin record update fails, as the plans might have succeeded
      }
    }

    return true;
  } catch (err: any) {
    console.error('[Firebase] Seed error:', err.message);
    throw err;
  }
}
