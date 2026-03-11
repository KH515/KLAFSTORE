export async function handleProducts(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;

  // جيب كل المنتجات
  if (path === '/api/products' && request.method === 'GET') {
    const products = await env.DB.prepare('SELECT * FROM products').all();
    return new Response(JSON.stringify(products.results), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // جيب منتج بالـ ID
  if (path.match(/^\/api\/products\/\d+$/) && request.method === 'GET') {
    const id = path.split('/')[3];
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!product) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(product), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // جيب منتج بالـ slug
  if (path.startsWith('/api/products/slug/') && request.method === 'GET') {
    const slug = path.split('/')[4];
    const product = await env.DB.prepare('SELECT * FROM products WHERE slug = ?').bind(slug).first();
    if (!product) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(product), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // إضافة منتج
  if (path === '/api/products' && request.method === 'POST') {
    const { name, description, price, stock, image_url, category } = await request.json();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, '').substring(0, 50) + '-' + Math.random().toString(36).substring(2, 7);
    await env.DB.prepare('INSERT INTO products (name, description, price, stock, image_url, category, slug) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(name, description, price, stock, image_url, category || null, slug).run();
    return new Response(JSON.stringify({ message: 'added', slug }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // تعديل منتج
  if (path.match(/^\/api\/products\/\d+$/) && request.method === 'PUT') {
    const id = path.split('/')[3];
    const { name, description, price, stock, image_url, category } = await request.json();
    await env.DB.prepare('UPDATE products SET name=?, description=?, price=?, stock=?, image_url=?, category=? WHERE id=?').bind(name, description, price, stock, image_url, category || null, id).run();
    return new Response(JSON.stringify({ message: 'updated' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // حذف منتج
  if (path.match(/^\/api\/products\/\d+$/) && request.method === 'DELETE') {
    const id = path.split('/')[3];
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ message: 'deleted' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}