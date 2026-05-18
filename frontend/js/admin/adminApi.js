(function attachAdminApi(global) {
  const API_BASE_URL = global.location.origin;

  async function request(path, options) {
    const headers = {
      Accept: 'application/json'
    };
    const token = global.AdminAuth.getToken();

    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }

    if (options && options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(API_BASE_URL + path, {
      method: (options && options.method) || 'GET',
      headers: headers,
      body: options && options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
    const responseBody = await response.json().catch(function ignoreInvalidJson() {
      return null;
    });

    if (response.status === 401) {
      global.AdminAuth.clearSession();
      const unauthorizedError = new Error(responseBody && responseBody.error ? responseBody.error : 'authentication required');

      unauthorizedError.status = 401;
      throw unauthorizedError;
    }

    if (!response.ok) {
      throw new Error(responseBody && responseBody.error ? responseBody.error : 'API request failed');
    }

    return responseBody;
  }

  global.AdminApi = {
    API_BASE_URL,
    login(payload) {
      return request('/api/auth/login', {
        method: 'POST',
        body: payload
      });
    },
    getOrders() {
      return request('/api/admin/orders');
    },
    getOrderById(orderId) {
      return request('/api/admin/orders/' + orderId);
    },
    updateOrderStatus(orderId, status) {
      return request('/api/admin/orders/' + orderId + '/status', {
        method: 'PUT',
        body: { status: status }
      });
    },
    cancelOrder(orderId) {
      return request('/api/admin/orders/' + orderId, {
        method: 'DELETE'
      });
    },
    getProducts() {
      return request('/api/admin/products');
    },
    getProductById(productId) {
      return request('/api/admin/products/' + productId);
    },
    createProduct(payload) {
      return request('/api/admin/products', {
        method: 'POST',
        body: payload
      });
    },
    updateProduct(productId, payload) {
      return request('/api/admin/products/' + productId, {
        method: 'PUT',
        body: payload
      });
    },
    deleteProduct(productId) {
      return request('/api/admin/products/' + productId, {
        method: 'DELETE'
      });
    },
    getCategories() {
      return request('/api/admin/categories');
    },
    getCategoryById(categoryId) {
      return request('/api/admin/categories/' + categoryId);
    },
    createCategory(payload) {
      return request('/api/admin/categories', {
        method: 'POST',
        body: payload
      });
    },
    updateCategory(categoryId, payload) {
      return request('/api/admin/categories/' + categoryId, {
        method: 'PUT',
        body: payload
      });
    },
    deleteCategory(categoryId) {
      return request('/api/admin/categories/' + categoryId, {
        method: 'DELETE'
      });
    },
    getSettings() {
      return request('/api/admin/settings');
    },
    updateSettings(payload) {
      return request('/api/admin/settings', {
        method: 'PUT',
        body: payload
      });
    }
  };
})(window);
