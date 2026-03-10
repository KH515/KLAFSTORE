const fs = require('fs');

fs.writeFileSync('src/routes/products.js', `export async function handleProducts(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === '/api/products' && request.method === 'GET') {
    const products = await env.DB.prepare('SELECT * FROM products').all();
    return new Response(JSON.stringify(products.results), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (path.startsWith('/api/products/') && request.method === 'GET') {
    const id = path.split('/')[3];
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!product) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(product), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (path === '/api/products' && request.method === 'POST') {
    const { name, description, price, stock, image_url } = await request.json();
    await env.DB.prepare('INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)').bind(name, description, price, stock, image_url).run();
    return new Response(JSON.stringify({ message: 'added' }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (path.startsWith('/api/products/') && request.method === 'PUT') {
    const id = path.split('/')[3];
    const { name, description, price, stock, image_url } = await request.json();
    await env.DB.prepare('UPDATE products SET name=?, description=?, price=?, stock=?, image_url=? WHERE id=?').bind(name, description, price, stock, image_url, id).run();
    return new Response(JSON.stringify({ message: 'updated' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (path.startsWith('/api/products/') && request.method === 'DELETE') {
    const id = path.split('/')[3];
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ message: 'deleted' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  return new Response('Not Found', { status: 404, headers: corsHeaders });
}`, 'utf8');

fs.writeFileSync('src/routes/orders.js', `export async function handleOrders(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === '/api/orders' && request.method === 'POST') {
    const { user_id, items, address } = await request.json();
    let total = 0;
    for (const item of items) {
      const product = await env.DB.prepare('SELECT price FROM products WHERE id = ?').bind(item.product_id).first();
      total += product.price * item.quantity;
    }
    const order = await env.DB.prepare('INSERT INTO orders (user_id, status, total, address, created_at) VALUES (?, ?, ?, ?, ?)').bind(user_id, 'pending', total, address, new Date().toISOString()).run();
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
}`, 'utf8');

console.log('تم بنجاح!');