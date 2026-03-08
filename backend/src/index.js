import { handleAuth } from './routes/auth.js';
import { handleProducts } from './routes/products.js';
import { handleOrders } from './routes/orders.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Routes
    if (path.startsWith('/api/auth'))     return handleAuth(request, env, corsHeaders);
    if (path.startsWith('/api/products')) return handleProducts(request, env, corsHeaders);
    if (path.startsWith('/api/orders'))   return handleOrders(request, env, corsHeaders);

    return new Response('Not Found', { status: 404 });
  }
};