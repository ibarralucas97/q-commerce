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
      const unauthorizedError = new Error(
        responseBody && (responseBody.message || responseBody.error)
          ? (responseBody.message || responseBody.error)
          : 'authentication required'
      );

      unauthorizedError.status = 401;
      throw unauthorizedError;
    }

    if (!response.ok) {
      throw new Error(
        responseBody && (responseBody.message || responseBody.error)
          ? (responseBody.message || responseBody.error)
          : 'API request failed'
      );
    }

    return responseBody;
  }

  async function uploadFile(path, file) {
    const formData = new FormData();
    const headers = {};
    const token = global.AdminAuth.getToken();

    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }

    formData.append('image', file);

    const response = await fetch(API_BASE_URL + path, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    const responseBody = await response.json().catch(function ignoreInvalidJson() {
      return null;
    });

    if (response.status === 401) {
      global.AdminAuth.clearSession();
      const unauthorizedError = new Error(
        responseBody && (responseBody.message || responseBody.error)
          ? (responseBody.message || responseBody.error)
          : 'authentication required'
      );

      unauthorizedError.status = 401;
      throw unauthorizedError;
    }

    if (!response.ok) {
      throw new Error(
        responseBody && (responseBody.message || responseBody.error)
          ? (responseBody.message || responseBody.error)
          : 'API request failed'
      );
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
    getOrders(options) {
      const query = [];

      if (options && options.scope === 'all') {
        query.push('scope=all');
      }

      if (options && Number.isInteger(options.closure_id)) {
        query.push('closure_id=' + options.closure_id);
      }

      return request('/api/admin/orders' + (query.length > 0 ? '?' + query.join('&') : ''));
    },
    getDashboardSummary() {
      return request('/api/admin/dashboard/summary');
    },
    getClosures() {
      return request('/api/admin/closures');
    },
    getClosureById(closureId) {
      return request('/api/admin/closures/' + closureId);
    },
    closeActiveBatch(notes) {
      return request('/api/admin/closures/close', {
        method: 'POST',
        body: {
          notes: notes || null
        }
      });
    },
    getExpenses() {
      return request('/api/admin/expenses');
    },
    getExpenseById(expenseId) {
      return request('/api/admin/expenses/' + expenseId);
    },
    createExpense(payload) {
      return request('/api/admin/expenses', {
        method: 'POST',
        body: payload
      });
    },
    updateExpense(expenseId, payload) {
      return request('/api/admin/expenses/' + expenseId, {
        method: 'PUT',
        body: payload
      });
    },
    deleteExpense(expenseId) {
      return request('/api/admin/expenses/' + expenseId, {
        method: 'DELETE'
      });
    },
    getOrderById(orderId) {
      return request('/api/admin/orders/' + orderId);
    },
    createOrder(payload) {
      return request('/api/orders', {
        method: 'POST',
        body: payload
      });
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
    uploadProductImage(file) {
      return uploadFile('/api/admin/uploads/product-image', file);
    },
    deleteProduct(productId) {
      return request('/api/admin/products/' + productId, {
        method: 'DELETE'
      });
    },
    getProductOptions(productId) {
      return request('/api/admin/products/' + productId + '/options');
    },
    createProductOption(productId, payload) {
      return request('/api/admin/products/' + productId + '/options', {
        method: 'POST',
        body: payload
      });
    },
    updateProductOption(optionId, payload) {
      return request('/api/admin/product-options/' + optionId, {
        method: 'PUT',
        body: payload
      });
    },
    deleteProductOption(optionId) {
      return request('/api/admin/product-options/' + optionId, {
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
    },
    getFulfillmentSchedules() {
      return request('/api/admin/fulfillment-schedules');
    },
    createFulfillmentSchedule(payload) {
      return request('/api/admin/fulfillment-schedules', {
        method: 'POST',
        body: payload
      });
    },
    updateFulfillmentSchedule(scheduleId, payload) {
      return request('/api/admin/fulfillment-schedules/' + scheduleId, {
        method: 'PUT',
        body: payload
      });
    },
    deleteFulfillmentSchedule(scheduleId) {
      return request('/api/admin/fulfillment-schedules/' + scheduleId, {
        method: 'DELETE'
      });
    }
  };
})(window);
