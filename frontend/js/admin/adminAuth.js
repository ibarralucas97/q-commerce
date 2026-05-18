(function attachAdminAuth(global) {
  const TOKEN_KEY = 'qcommerce-admin-token';
  const USER_KEY = 'qcommerce-admin-user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || null));
  }

  function getUser() {
    try {
      const storedUser = localStorage.getItem(USER_KEY);

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing admin session user:', error);
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  global.AdminAuth = {
    getToken,
    setSession,
    getUser,
    clearSession
  };
})(window);
