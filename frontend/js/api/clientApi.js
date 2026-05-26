(function attachClientApi(global) {
  const API_BASE_URL = global.location.origin;

  async function request(path) {
    const response = await fetch(API_BASE_URL + path, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await readErrorBody(response);

      throw new Error(errorBody.message || errorBody.error || ('API request failed: ' + path));
    }

    return response.json();
  }

  async function requestJson(path, options) {
    const response = await fetch(API_BASE_URL + path, {
      method: options.method || 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options.body || {})
    });

    const responseBody = await response.json().catch(function ignoreInvalidJson() {
      return null;
    });

    if (!response.ok) {
      throw new Error(
        responseBody && (responseBody.message || responseBody.error)
          ? (responseBody.message || responseBody.error)
          : ('API request failed: ' + path)
      );
    }

    return responseBody;
  }

  async function readErrorBody(response) {
    const responseBody = await response.json().catch(function ignoreInvalidJson() {
      return null;
    });

    return responseBody || null;
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
    },
    getFulfillmentSchedules() {
      return request('/api/fulfillment-schedules');
    },
    createOrder(payload) {
      return requestJson('/api/orders', {
        method: 'POST',
        body: payload
      });
    }
  };
})(window);
