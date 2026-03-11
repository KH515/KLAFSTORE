const fs = require('fs');

let orders = fs.readFileSync('src/routes/orders.js', 'utf8');

orders = orders.replace(
  "const { user_id, items, address } = await request.json();",
  "const { user_id, items, address, phone } = await request.json();"
);

orders = orders.replace(
  "'INSERT INTO orders (user_id, status, total, address, created_at) VALUES (?, ?, ?, ?, ?)').bind(user_id, 'pending', total, address, new Date().toISOString())",
  "'INSERT INTO orders (user_id, status, total, address, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(user_id, 'pending', total, address, phone || null, new Date().toISOString())"
);

fs.writeFileSync('src/routes/orders.js', orders, 'utf8');
console.log('done');