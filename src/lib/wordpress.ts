import api from './api';
import { WPConfig } from '../types';

export const wpFetch = async (config: WPConfig, endpoint: string = '/', method = 'GET', data?: any, params?: any, full = false) => {
  if (!config || !config.url) {
    throw new Error('WP Configuration is missing or incomplete');
  }

  const safeEndpoint = endpoint || '/';

  // Determine auth: Prioritize Consumer Keys for WooCommerce routes
  let auth: string;
  const username = (config.username || config.consumerKey || '').trim();
  const password = (config.applicationPassword || config.consumerSecret || '').trim();

  if (safeEndpoint.includes('/wc/') && config.consumerKey && config.consumerSecret) {
    auth = btoa(`${username}:${password}`);
  } else {
    auth = btoa(`${username}:${password}`);
  }

  let baseUrl = config.url.trim().replace(/\/$/, '');
  
  // Ensure protocol
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }

  // Strip /wp-admin or /wp-login.php if user included it in the URL
  baseUrl = baseUrl.replace(/\/wp-admin(\/.*)?$/, '');
  baseUrl = baseUrl.replace(/\/wp-login\.php$/, '');

  const alternateBaseUrl = baseUrl.includes('://www.') 
    ? baseUrl.replace('://www.', '://') 
    : baseUrl.replace('://', '://www.');

  // Try standard variants
  const variants = [
    `${baseUrl}/wp-json${safeEndpoint.startsWith('/') ? '' : '/'}${safeEndpoint}`,
    `${baseUrl}/?rest_route=${safeEndpoint.startsWith('/') ? '' : '/'}${safeEndpoint}`,
    `${baseUrl}/index.php/wp-json${safeEndpoint.startsWith('/') ? '' : '/'}${safeEndpoint}`,
    `${baseUrl}/index.php?rest_route=${safeEndpoint.startsWith('/') ? '' : '/'}${safeEndpoint}`,
    `${alternateBaseUrl}/wp-json${safeEndpoint.startsWith('/') ? '' : '/'}${safeEndpoint}`,
    `${alternateBaseUrl}/?rest_route=${safeEndpoint.startsWith('/') ? '' : '/'}${safeEndpoint}`,
    `${alternateBaseUrl}/index.php?rest_route=${safeEndpoint.startsWith('/') ? '' : '/'}${safeEndpoint}`
  ];

  // Helper to wait
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const tryRequest = async (url: string, tryQueryAuth = false) => {
    try {
      let finalUrl = url;
      let finalParams = { ...params };
      let currentAuth = auth;
      let finalMethod = method;
      let finalHeaders: any = {};

      // WooCommerce specific enhancements
      if (safeEndpoint.includes('/wc/')) {
        // 1. Handle WooCommerce Query Param Auth Fallback
        if (tryQueryAuth) {
          const ck = config.consumerKey || config.username;
          const cs = config.consumerSecret || config.applicationPassword;
          if (ck && cs) {
            finalParams.consumer_key = ck;
            finalParams.consumer_secret = cs;
            currentAuth = ''; // Clear header auth when using query params
          }
        }

        // 2. HTTP Method Override for restricted servers (PUT/DELETE)
        // We now always include the override headers/params for WooCommerce PUT/DELETE
        // as it's the most compatible way for shared hosting.
        if (method === 'PUT' || method === 'DELETE') {
          finalParams._method = method;
          finalHeaders['X-HTTP-Method-Override'] = method;
          finalMethod = 'POST';
        }
      }

      const res = await api.post('/api/wp-proxy', {
        url: finalUrl,
        method: finalMethod,
        auth: currentAuth,
        data: data, // Removed || {} to avoid forcing bodies on DELETE
        params: finalParams,
        headers: finalHeaders,
      }).catch(err => {
        if (err.response?.status === 404 && !window.location.hostname.includes('europe-west2.run.app')) {
           throw new Error("L'hébergement actuel (Vercel/Static) ne supporte pas le Proxy Nexus. Veuillez utiliser l'URL officielle de l'application ou configurer un backend.");
        }
        throw err;
      });
      return res.data;
    } catch (err: any) {
      throw err;
    }
  };

  let lastError: any = null;
  
  // 1. Try standard discovery
  for (const url of variants) {
    // Stage 1: Try with Authorization Header
    try {
      const response = await tryRequest(url, false);
      if (response && response.data) return full ? response : response.data;
    } catch (error: any) {
      lastError = error;
    }

    // Stage 2: Fallback to Query Parameters for WooCommerce (Most reliable for shared hosting)
    if (safeEndpoint.includes('/wc/')) {
      try {
        const response = await tryRequest(url, true);
        if (response && response.data) return full ? response : response.data;
      } catch (error: any) {
        lastError = error;
      }
    }
  }

  // 2. Advanced Discovery: Try to find the API root from the homepage Link tag
  try {
    const homeRes = await api.post('/api/wp-proxy', { url: baseUrl, method: 'GET' });
    const html = homeRes.data?.data;
    if (typeof html === 'string') {
      // Look for <link rel='https://api.w.org/' href='https://domain.com/wp-json/' />
      const match = html.match(/rel=['"]https:\/\/api\.w\.org\/['"]\s+href=['"]([^'"]+)['"]/i) || 
                    html.match(/href=['"]([^'"]+)['"]\s+rel=['"]https:\/\/api\.w\.org\/['"]/i);
      
      if (match && match[1]) {
        let discoveredRoot = match[1].replace(/\/$/, '');
        // If it's relative
        if (!discoveredRoot.startsWith('http')) {
           discoveredRoot = baseUrl + (discoveredRoot.startsWith('/') ? '' : '/') + discoveredRoot;
        }
        
        const finalUrl = discoveredRoot.includes('?') 
          ? `${discoveredRoot}&rest_route=${safeEndpoint}`
          : `${discoveredRoot}${safeEndpoint}`;
          
        try {
          const response = await tryRequest(finalUrl);
          return full ? response : response.data;
        } catch (e) {
          // Discovery failed too
        }
      }
    }
  } catch (e) {
    // Discovery failed
  }

  console.error(`WP Fetch All Variants Failed (${safeEndpoint}):`, lastError?.status || lastError?.message || 'Unknown Failure');
  throw lastError || new Error(`Impossible de se connecter à votre WordPress sur l'endpoint ${safeEndpoint}. Vérifiez l'URL et les accès API.`);
};

export const testWPConnection = async (config: WPConfig) => {
  try {
    // If WooCommerce keys are provided, try a WC endpoint first
    if (config.consumerKey && config.consumerSecret) {
      try {
        // Try with Authorization header first via wpFetch
        return await wpFetch(config, '/wc/v3/system_status');
      } catch (wcErr) {
        // If that fails, try manually with query parameters (often more compatible)
        const baseUrl = config.url.trim().replace(/\/$/, '');
        const ck = config.consumerKey;
        const cs = config.consumerSecret;
        const urlWithParams = `${baseUrl}/wp-json/wc/v3/system_status?consumer_key=${ck}&consumer_secret=${cs}`;
        try {
          const response = await api.post('/api/wp-proxy', {
            url: urlWithParams,
            method: 'GET'
          });
          if (response.data && response.data.data) return response.data.data;
        } catch (e2) {
          // Both failed
          throw wcErr;
        }
      }
    }

    // Try users/me first for standard WP auth
    return await wpFetch(config, '/wp/v2/users/me');
  } catch (error: any) {
    // If it's a 404 or 403 on users/me, it might just be disabled OR the site doesn't have users/me
    // Try the root API endpoint (/) which should return the site name and routes
    const status = error.response?.status;
    if (status === 404 || status === 403 || status === 401 || status === 500) {
       try {
         // This is the root of the REST API
         return await wpFetch(config, '/');
       } catch (e) {
         // If root also fails, then there's a real connection problem
         throw error;
       }
    }
    throw error;
  }
};

export const getPosts = async (config: WPConfig, params?: any) => {
  return wpFetch(config, '/wp/v2/posts', 'GET', null, params);
};

export const getPages = async (config: WPConfig, params?: any) => {
  return wpFetch(config, '/wp/v2/pages', 'GET', null, params);
};

export const getProducts = async (config: WPConfig, params?: any, full = false) => {
  return wpFetch(config, '/wc/v3/products', 'GET', null, params, full);
};

export const getProductCategories = async (config: WPConfig, params?: any) => {
  return wpFetch(config, '/wc/v3/products/categories', 'GET', null, params);
};

export const updatePost = async (config: WPConfig, id: number, data: any) => {
  return wpFetch(config, `/wp/v2/posts/${id}`, 'POST', data);
};

export const updatePage = async (config: WPConfig, id: number, data: any) => {
  return wpFetch(config, `/wp/v2/pages/${id}`, 'POST', data);
};

export const updateProduct = async (config: WPConfig, id: number, data: any) => {
  return wpFetch(config, `/wc/v3/products/${id}`, 'PUT', data);
};

export const deleteProduct = async (config: WPConfig, id: number) => {
  return wpFetch(config, `/wc/v3/products/${id}`, 'DELETE', null, { force: true });
};

export const getOrders = async (config: WPConfig, params?: any) => {
  return wpFetch(config, '/wc/v3/orders', 'GET', null, params);
};

export const updateOrder = async (config: WPConfig, id: number, data: any) => {
  return wpFetch(config, `/wc/v3/orders/${id}`, 'PUT', data);
};

export const getCustomers = async (config: WPConfig, params?: any) => {
  return wpFetch(config, '/wc/v3/customers', 'GET', null, params);
};

export const updateCustomer = async (config: WPConfig, id: number, data: any) => {
  return wpFetch(config, `/wc/v3/customers/${id}`, 'PUT', data);
};
