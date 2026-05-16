import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, method, auth, data, params } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const targetUrl = new URL(url);
    const headers: any = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': targetUrl.origin + '/',
      'Origin': targetUrl.origin,
    };

    if (auth) {
      headers['Authorization'] = auth.startsWith('Basic ') ? auth : `Basic ${auth}`;
    }

    const response = await axios({
      url,
      method: method || 'GET',
      headers,
      data: method !== 'GET' ? data : undefined,
      params,
      timeout: 30000,
      validateStatus: () => true,
    });

    const contentType = String(response.headers['content-type'] || '');
    if (contentType.includes('text/html') && (url.includes('wp-json') || url.includes('rest_route'))) {
      return res.status(404).json({ 
        error: 'HTML_RESPONSE',
        message: 'Le site a renvoyé du HTML au lieu de JSON.',
        url 
      });
    }

    return res.status(response.status).json({
      data: response.data,
      status: response.status,
      headers: {
        'x-wp-total': response.headers['x-wp-total'],
        'x-wp-totalpages': response.headers['x-wp-totalpages'],
      }
    });

  } catch (error: any) {
    console.error(`Vercel Proxy Error for ${url}:`, error.message);
    return res.status(500).json({ 
      error: 'Nexus Proxy Error', 
      message: error.message,
      detail: error.response?.data
    });
  }
}
