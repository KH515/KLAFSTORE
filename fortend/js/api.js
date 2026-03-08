const API = 'https://klaf-api.workers.dev';

// دالة عامة للطلبات
async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };

  // أضف التوكن لو موجود
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API}${endpoint}`, options);
  const data = await res.json();

  // لو انتهت الجلسة
  if (res.status === 401) {
    logout();
    return;
  }

  return { ok: res.ok, data };
}

// ====== المنتجات ======
async function getProducts() {
  return await apiRequest('/api/products');
}

async function getProduct(id) {
  return await apiRequest(`/api/products/${id}`);
}

async function addProduct(product) {
  return await apiRequest('/api/products', 'POST', product);
}

async function updateProduct(id, product) {
  return await apiRequest(`/api/products/${id}`, 'PUT', product);
}

async function deleteProduct(id) {
  return await apiRequest(`/api/products/${id}`, 'DELETE');
}

// ====== الطلبات ======
async function createOrder(order) {
  return await apiRequest('/api/orders', 'POST', order);
}

async function getUserOrders(userId) {
  return await apiRequest(`/api/orders/user/${userId}`);
}

async function getAllOrders() {
  return await apiRequest('/api/orders');
}

async function updateOrderStatus(id, status) {
  return await apiRequest(`/api/orders/${id}`, 'PUT', { status });
}