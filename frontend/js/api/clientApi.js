(function attachClientApi(global) {
  const API_BASE_URL = 'http://localhost:3000';

  async function request(path) {
    const response = await fetch(API_BASE_URL + path, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('API request failed: ' + path);
    }

    return response.json();
  }

  global.ClientApi = {
    API_BASE_URL,
    getSettings() {
      return request('/api/settings');
    },
    getCategories() {
      return request('/api/categories');
    },
    getProducts() {
      return request('/api/products');
    }
  };
})(window);
