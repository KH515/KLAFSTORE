const fs = require('fs');

let auth = fs.readFileSync('src/routes/auth.js', 'utf8');

const newEndpoint = `
  if (path.startsWith('/api/auth/user/') && request.method === 'GET') {
    const id = path.split('/')[4];
    const user = await env.DB.prepare('SELECT id, name, email, role FROM users WHERE id = ?').bind(id).first();
    if (!user) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(user), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}`;

auth = auth.replace("  return new Response('Not Found', { status: 404, headers: corsHeaders });\n}", newEndpoint);

fs.writeFileSync('src/routes/auth.js', auth, 'utf8');
console.log('done');