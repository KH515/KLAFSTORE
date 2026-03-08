// حفظ بيانات المستخدم بعد تسجيل الدخول
function saveUser(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// جيب التوكن
function getToken() {
  return localStorage.getItem('token');
}

// جيب بيانات المستخدم
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// تحقق هل مسجل دخول
function isLoggedIn() {
  return getToken() !== null;
}

// تحقق هل أدمن
function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

// تسجيل خروج
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// حماية الصفحة — لو مو مسجل دخول يروح login
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// حماية صفحة الأدمن
function requireAdmin() {
  if (!isLoggedIn() || !isAdmin()) {
    window.location.href = 'login.html';
  }
}