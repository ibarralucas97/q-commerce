(function bootstrapAdminApp(global) {
  const state = {
    activeTab: 'orders',
    orders: [],
    products: [],
    categories: [],
    settings: null,
    selectedOrderId: null
  };

  const elements = {
    loginView: document.getElementById('loginView'),
    panelView: document.getElementById('panelView'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginButton: document.getElementById('loginButton'),
    loginMessage: document.getElementById('loginMessage'),
    adminIdentity: document.getElementById('adminIdentity'),
    logoutButton: document.getElementById('logoutButton'),
    panelMessage: document.getElementById('panelMessage'),
    adminTabs: document.getElementById('adminTabs'),
    sections: Array.from(document.querySelectorAll('[data-section]')),
    ordersList: document.getElementById('ordersList'),
    orderDetailCard: document.getElementById('orderDetailCard'),
    orderDetailTitle: document.getElementById('orderDetailTitle'),
    orderDetailBody: document.getElementById('orderDetailBody'),
    refreshOrdersButton: document.getElementById('refreshOrdersButton'),
    productForm: document.getElementById('productForm'),
    productId: document.getElementById('productId'),
    productCategoryId: document.getElementById('productCategoryId'),
    productName: document.getElementById('productName'),
    productDescription: document.getElementById('productDescription'),
    productPrice: document.getElementById('productPrice'),
    productImageUrl: document.getElementById('productImageUrl'),
    productStock: document.getElementById('productStock'),
    productIsActive: document.getElementById('productIsActive'),
    productsList: document.getElementById('productsList'),
    resetProductFormButton: document.getElementById('resetProductFormButton'),
    categoryForm: document.getElementById('categoryForm'),
    categoryId: document.getElementById('categoryId'),
    categoryName: document.getElementById('categoryName'),
    categoryDescription: document.getElementById('categoryDescription'),
    categoryIsActive: document.getElementById('categoryIsActive'),
    categoriesList: document.getElementById('categoriesList'),
    resetCategoryFormButton: document.getElementById('resetCategoryFormButton'),
    settingsForm: document.getElementById('settingsForm'),
    settingsStoreName: document.getElementById('settingsStoreName'),
    settingsDescription: document.getElementById('settingsDescription'),
    settingsWhatsapp: document.getElementById('settingsWhatsapp'),
    settingsAddress: document.getElementById('settingsAddress'),
    settingsZone: document.getElementById('settingsZone'),
    settingsCity: document.getElementById('settingsCity'),
    settingsCurrency: document.getElementById('settingsCurrency'),
    settingsDeliveryFee: document.getElementById('settingsDeliveryFee'),
    settingsLogoUrl: document.getElementById('settingsLogoUrl'),
    settingsBannerUrl: document.getElementById('settingsBannerUrl'),
    settingsPrimaryColor: document.getElementById('settingsPrimaryColor'),
    settingsSecondaryColor: document.getElementById('settingsSecondaryColor'),
    settingsDeliveryEnabled: document.getElementById('settingsDeliveryEnabled'),
    settingsPickupEnabled: document.getElementById('settingsPickupEnabled'),
    settingsIsActive: document.getElementById('settingsIsActive')
  };

  function setMessage(message) {
    elements.panelMessage.textContent = message || '';
  }

  function setLoginMessage(message) {
    elements.loginMessage.textContent = message || '';
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: state.settings && state.settings.currency_symbol ? state.settings.currency_symbol : 'ARS',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function setAuthState(isAuthenticated) {
    elements.loginView.classList.toggle('is-hidden', isAuthenticated);
    elements.panelView.classList.toggle('is-hidden', !isAuthenticated);
    const user = global.AdminAuth.getUser();

    elements.adminIdentity.textContent = user && user.username ? user.username : 'Administrador';
  }

  function setActiveTab(tabName) {
    state.activeTab = tabName;

    Array.from(elements.adminTabs.querySelectorAll('[data-tab]')).forEach(function toggleTab(button) {
      button.classList.toggle('is-active', button.getAttribute('data-tab') === tabName);
    });

    elements.sections.forEach(function toggleSection(section) {
      section.classList.toggle('is-hidden', section.getAttribute('data-section') !== tabName);
    });
  }

  function resetCategoryForm() {
    elements.categoryForm.reset();
    elements.categoryId.value = '';
    elements.categoryIsActive.checked = true;
  }

  function resetProductForm() {
    elements.productForm.reset();
    elements.productId.value = '';
    elements.productIsActive.checked = true;
    elements.productCategoryId.value = '';
  }

  function populateCategorySelect() {
    const options = ['<option value="">Sin categoría</option>'].concat(
      state.categories.map(function toOption(category) {
        return '<option value="' + category.id + '">' + escapeHtml(category.name) + '</option>';
      })
    );

    elements.productCategoryId.innerHTML = options.join('');
  }

  function renderOrders() {
    if (state.orders.length === 0) {
      elements.ordersList.innerHTML = '<article class="list-card"><p class="muted">Todavía no hay pedidos.</p></article>';
      return;
    }

    elements.ordersList.innerHTML = state.orders.map(function toOrderCard(order) {
      return [
        '<article class="order-card">',
        '  <div class="order-card__header">',
        '    <div>',
        '      <strong>#' + order.id + ' · ' + escapeHtml(order.customer_name) + '</strong>',
        '      <div class="order-meta">',
        '        <span>' + escapeHtml(order.customer_phone) + ' · ' + escapeHtml(order.delivery_type) + '</span>',
        '        <span>' + escapeHtml(formatDate(order.created_at)) + '</span>',
        '      </div>',
        '    </div>',
        '    <span class="status-chip">' + escapeHtml(order.status) + '</span>',
        '  </div>',
        '  <div class="card-actions">',
        '    <strong>' + escapeHtml(formatMoney(order.total)) + '</strong>',
        '    <div class="card-actions">',
        '      <select class="inline-select" data-order-status="' + order.id + '">',
        renderStatusOptions(order.status),
        '      </select>',
        '      <button class="status-action" type="button" data-view-order="' + order.id + '">Ver</button>',
        '      <button class="status-action" type="button" data-cancel-order="' + order.id + '">Cancelar</button>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderStatusOptions(selectedStatus) {
    return ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
      .map(function toOption(status) {
        const selected = status === selectedStatus ? ' selected' : '';

        return '<option value="' + status + '"' + selected + '>' + status + '</option>';
      })
      .join('');
  }

  function renderOrderDetail() {
    const order = state.orders.find(function findOrder(item) {
      return item.id === state.selectedOrderId;
    });

    if (!order) {
      elements.orderDetailCard.classList.add('is-hidden');
      elements.orderDetailBody.innerHTML = '';
      return;
    }

    elements.orderDetailCard.classList.remove('is-hidden');
    elements.orderDetailTitle.textContent = 'Pedido #' + order.id;
    elements.orderDetailBody.innerHTML = '<p class="muted">Cargando detalle...</p>';
  }

  function renderProducts() {
    if (state.products.length === 0) {
      elements.productsList.innerHTML = '<article class="list-card"><p class="muted">No hay productos cargados.</p></article>';
      return;
    }

    elements.productsList.innerHTML = state.products.map(function toCard(product) {
      return [
        '<article class="list-card">',
        '  <div class="list-row">',
        '    <div>',
        '      <strong>' + escapeHtml(product.name) + '</strong>',
        '      <div class="list-meta">',
        '        <span>' + escapeHtml(product.category_name || 'Sin categoría') + '</span>',
        '        <span>' + escapeHtml(formatMoney(product.price)) + ' · Stock: ' + escapeHtml(product.stock == null ? 'N/D' : product.stock) + '</span>',
        '      </div>',
        '    </div>',
        '    <span class="status-chip">' + escapeHtml(product.is_active ? 'active' : 'inactive') + '</span>',
        '  </div>',
        '  <div class="card-actions">',
        '    <button class="status-action" type="button" data-edit-product="' + product.id + '">Editar</button>',
        '    <button class="status-action" type="button" data-delete-product="' + product.id + '">Desactivar</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderCategories() {
    if (state.categories.length === 0) {
      elements.categoriesList.innerHTML = '<article class="list-card"><p class="muted">No hay categorías cargadas.</p></article>';
      return;
    }

    elements.categoriesList.innerHTML = state.categories.map(function toCard(category) {
      return [
        '<article class="list-card">',
        '  <div class="list-row">',
        '    <div>',
        '      <strong>' + escapeHtml(category.name) + '</strong>',
        '      <div class="list-meta"><span>' + escapeHtml(category.description || 'Sin descripción') + '</span></div>',
        '    </div>',
        '    <span class="status-chip">' + escapeHtml(category.is_active ? 'active' : 'inactive') + '</span>',
        '  </div>',
        '  <div class="card-actions">',
        '    <button class="status-action" type="button" data-edit-category="' + category.id + '">Editar</button>',
        '    <button class="status-action" type="button" data-delete-category="' + category.id + '">Desactivar</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function fillSettingsForm() {
    if (!state.settings) {
      return;
    }

    elements.settingsStoreName.value = state.settings.store_name || '';
    elements.settingsDescription.value = state.settings.store_description || '';
    elements.settingsWhatsapp.value = state.settings.whatsapp_number || '';
    elements.settingsAddress.value = state.settings.address || '';
    elements.settingsZone.value = state.settings.zone || '';
    elements.settingsCity.value = state.settings.city || '';
    elements.settingsCurrency.value = state.settings.currency_symbol || 'ARS';
    elements.settingsDeliveryFee.value = state.settings.delivery_fee || 0;
    elements.settingsLogoUrl.value = state.settings.logo_url || '';
    elements.settingsBannerUrl.value = state.settings.banner_url || '';
    elements.settingsPrimaryColor.value = state.settings.primary_color || '';
    elements.settingsSecondaryColor.value = state.settings.secondary_color || '';
    elements.settingsDeliveryEnabled.checked = Boolean(state.settings.delivery_enabled);
    elements.settingsPickupEnabled.checked = Boolean(state.settings.pickup_enabled);
    elements.settingsIsActive.checked = Boolean(state.settings.is_active);
  }

  async function loadOrderDetail(orderId) {
    try {
      const detail = await global.AdminApi.getOrderById(orderId);

      elements.orderDetailCard.classList.remove('is-hidden');
      elements.orderDetailTitle.textContent = 'Pedido #' + detail.id;
      elements.orderDetailBody.innerHTML = [
        '<div><strong>Cliente:</strong> ' + escapeHtml(detail.customer_name) + '</div>',
        '<div><strong>Teléfono:</strong> ' + escapeHtml(detail.customer_phone) + '</div>',
        '<div><strong>Entrega:</strong> ' + escapeHtml(detail.delivery_type) + '</div>',
        '<div><strong>Dirección:</strong> ' + escapeHtml(detail.address || '-') + '</div>',
        '<div><strong>Estado:</strong> ' + escapeHtml(detail.status) + '</div>',
        '<div><strong>Observaciones:</strong> ' + escapeHtml(detail.notes || '-') + '</div>',
        '<div><strong>Total:</strong> ' + escapeHtml(formatMoney(detail.total)) + '</div>',
        '<div><strong>Items:</strong></div>',
        '<ul>' + detail.items.map(function toItem(item) {
          return '<li>' + escapeHtml(item.quantity + ' x ' + item.product_name + ' · ' + formatMoney(item.subtotal)) + '</li>';
        }).join('') + '</ul>'
      ].join('');
    } catch (error) {
      handleApiError(error);
    }
  }

  async function loadDashboardData() {
    try {
      const data = await Promise.all([
        global.AdminApi.getOrders(),
        global.AdminApi.getProducts(),
        global.AdminApi.getCategories(),
        global.AdminApi.getSettings()
      ]);

      state.orders = data[0];
      state.products = data[1];
      state.categories = data[2];
      state.settings = data[3];

      populateCategorySelect();
      renderOrders();
      renderProducts();
      renderCategories();
      fillSettingsForm();
      renderOrderDetail();
      setMessage('Panel actualizado.');
    } catch (error) {
      handleApiError(error);
    }
  }

  function handleApiError(error) {
    console.error(error);

    if (error.status === 401) {
      global.AdminAuth.clearSession();
      setAuthState(false);
      setLoginMessage('Tu sesión venció o el token es inválido.');
      return;
    }

    setMessage(error.message || 'Ocurrió un error.');
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      elements.loginButton.disabled = true;
      setLoginMessage('Validando credenciales...');

      const result = await global.AdminApi.login({
        username: elements.loginUsername.value.trim(),
        password: elements.loginPassword.value
      });

      global.AdminAuth.setSession(result.token, result.user);
      setAuthState(true);
      setLoginMessage('');
      elements.loginForm.reset();
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      setLoginMessage(error.message || 'No se pudo iniciar sesión.');
    } finally {
      elements.loginButton.disabled = false;
    }
  }

  function handleLogout() {
    global.AdminAuth.clearSession();
    setAuthState(false);
    setMessage('');
    setLoginMessage('Sesión cerrada.');
  }

  async function handleTabAction(event) {
    const button = event.target.closest('[data-tab]');

    if (!button) {
      return;
    }

    setActiveTab(button.getAttribute('data-tab'));
  }

  async function handleOrdersListClick(event) {
    const viewButton = event.target.closest('[data-view-order]');
    const cancelButton = event.target.closest('[data-cancel-order]');

    if (viewButton) {
      state.selectedOrderId = Number.parseInt(viewButton.getAttribute('data-view-order'), 10);
      await loadOrderDetail(state.selectedOrderId);
    }

    if (cancelButton) {
      try {
        await global.AdminApi.cancelOrder(Number.parseInt(cancelButton.getAttribute('data-cancel-order'), 10));
        await loadDashboardData();
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  async function handleOrdersListChange(event) {
    const select = event.target.closest('[data-order-status]');

    if (!select) {
      return;
    }

    try {
      await global.AdminApi.updateOrderStatus(Number.parseInt(select.getAttribute('data-order-status'), 10), select.value);
      await loadDashboardData();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault();

    const payload = {
      category_id: elements.productCategoryId.value === '' ? null : Number.parseInt(elements.productCategoryId.value, 10),
      name: elements.productName.value.trim(),
      description: elements.productDescription.value.trim(),
      price: Number(elements.productPrice.value),
      image_url: elements.productImageUrl.value.trim() || null,
      stock: elements.productStock.value === '' ? null : Number.parseInt(elements.productStock.value, 10),
      is_active: elements.productIsActive.checked
    };

    try {
      if (elements.productId.value) {
        await global.AdminApi.updateProduct(Number.parseInt(elements.productId.value, 10), payload);
      } else {
        await global.AdminApi.createProduct(payload);
      }

      resetProductForm();
      await loadDashboardData();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleProductsListClick(event) {
    const editButton = event.target.closest('[data-edit-product]');
    const deleteButton = event.target.closest('[data-delete-product]');

    if (editButton) {
      const productId = Number.parseInt(editButton.getAttribute('data-edit-product'), 10);
      const product = await global.AdminApi.getProductById(productId);

      elements.productId.value = product.id;
      elements.productCategoryId.value = product.category_id == null ? '' : String(product.category_id);
      elements.productName.value = product.name || '';
      elements.productDescription.value = product.description || '';
      elements.productPrice.value = product.price || 0;
      elements.productImageUrl.value = product.image_url || '';
      elements.productStock.value = product.stock == null ? '' : product.stock;
      elements.productIsActive.checked = Boolean(product.is_active);
      setActiveTab('products');
      setMessage('Editando producto #' + product.id + '.');
    }

    if (deleteButton) {
      try {
        await global.AdminApi.deleteProduct(Number.parseInt(deleteButton.getAttribute('data-delete-product'), 10));
        await loadDashboardData();
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();

    const payload = {
      name: elements.categoryName.value.trim(),
      description: elements.categoryDescription.value.trim(),
      is_active: elements.categoryIsActive.checked
    };

    try {
      if (elements.categoryId.value) {
        await global.AdminApi.updateCategory(Number.parseInt(elements.categoryId.value, 10), payload);
      } else {
        await global.AdminApi.createCategory(payload);
      }

      resetCategoryForm();
      await loadDashboardData();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleCategoriesListClick(event) {
    const editButton = event.target.closest('[data-edit-category]');
    const deleteButton = event.target.closest('[data-delete-category]');

    if (editButton) {
      const category = await global.AdminApi.getCategoryById(Number.parseInt(editButton.getAttribute('data-edit-category'), 10));

      elements.categoryId.value = category.id;
      elements.categoryName.value = category.name || '';
      elements.categoryDescription.value = category.description || '';
      elements.categoryIsActive.checked = Boolean(category.is_active);
      setActiveTab('categories');
      setMessage('Editando categoría #' + category.id + '.');
    }

    if (deleteButton) {
      try {
        await global.AdminApi.deleteCategory(Number.parseInt(deleteButton.getAttribute('data-delete-category'), 10));
        await loadDashboardData();
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();

    try {
      await global.AdminApi.updateSettings({
        store_name: elements.settingsStoreName.value.trim(),
        store_description: elements.settingsDescription.value.trim(),
        whatsapp_number: elements.settingsWhatsapp.value.trim(),
        address: elements.settingsAddress.value.trim(),
        zone: elements.settingsZone.value.trim(),
        city: elements.settingsCity.value.trim(),
        currency_symbol: elements.settingsCurrency.value.trim(),
        delivery_fee: Number(elements.settingsDeliveryFee.value || 0),
        delivery_enabled: elements.settingsDeliveryEnabled.checked,
        pickup_enabled: elements.settingsPickupEnabled.checked,
        primary_color: elements.settingsPrimaryColor.value.trim(),
        secondary_color: elements.settingsSecondaryColor.value.trim(),
        logo_url: elements.settingsLogoUrl.value.trim(),
        banner_url: elements.settingsBannerUrl.value.trim(),
        is_active: elements.settingsIsActive.checked
      });

      await loadDashboardData();
    } catch (error) {
      handleApiError(error);
    }
  }

  function attachEvents() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.logoutButton.addEventListener('click', handleLogout);
    elements.adminTabs.addEventListener('click', handleTabAction);
    elements.refreshOrdersButton.addEventListener('click', loadDashboardData);
    elements.ordersList.addEventListener('click', handleOrdersListClick);
    elements.ordersList.addEventListener('change', handleOrdersListChange);
    elements.productForm.addEventListener('submit', handleProductSubmit);
    elements.productsList.addEventListener('click', handleProductsListClick);
    elements.resetProductFormButton.addEventListener('click', resetProductForm);
    elements.categoryForm.addEventListener('submit', handleCategorySubmit);
    elements.categoriesList.addEventListener('click', handleCategoriesListClick);
    elements.resetCategoryFormButton.addEventListener('click', resetCategoryForm);
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
  }

  async function init() {
    attachEvents();
    setActiveTab('orders');
    resetCategoryForm();
    resetProductForm();

    if (global.AdminAuth.getToken()) {
      setAuthState(true);
      await loadDashboardData();
    } else {
      setAuthState(false);
    }
  }

  init();
})(window);
