// جيب السلة من localStorage
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

// احفظ السلة
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// أضف منتج للسلة
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

// احذف منتج من السلة
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  updateCartCount();
}

// غيّر كمية منتج
function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) removeFromCart(productId);
    else saveCart(cart);
  }
  updateCartCount();
}

// احسب المجموع
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// عدد المنتجات في السلة
function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// حدّث عداد السلة في الصفحة
function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = getCartCount();
}

// فرّغ السلة
function clearCart() {
  localStorage.removeItem('cart');
  updateCartCount();
}