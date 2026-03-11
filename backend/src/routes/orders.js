export async function handleOrders(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === '/api/orders' && request.method === 'POST') {
    const { user_id, items, address, phone } = await request.json();
    let total = 0;
    for (const item of items) {
      const product = await env.DB.prepare('SELECT price FROM products WHERE id = ?').bind(item.product_id).first();
      total += product.price * item.quantity;
    }
    const order = await env.DB.prepare('INSERT INTO orders (user_id, status, total, address, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(user_id, 'pending', total, address, phone || null, new Date().toISOString()).run();
    const order_id = order.meta.last_row_id;
    for (const item of items) {
      const product = await env.DB.prepare('SELECT price FROM products WHERE id = ?').bind(item.product_id).first();
      await env.DB.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)').bind(order_id, item.product_id, item.quantity, product.price).run();
    }
    return new Response(JSON.stringify({ message: 'created', order_id }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (path.startsWith('/api/orders/user/') && request.method === 'GET') {
    const user_id = path.split('/')[4];
    const orders = await env.DB.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').bind(user_id).all();
    return new Response(JSON.stringify(orders.results), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (path === '/api/orders' && request.method === 'GET') {
    const orders = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(orders.results), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (path.startsWith('/api/orders/') && request.method === 'PUT') {
    const id = path.split('/')[3];
    const { status } = await request.json();
    await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, id).run();
    return new Response(JSON.stringify({ message: 'updated' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  return new Response('Not Found', { status: 404, headers: corsHeaders });
}