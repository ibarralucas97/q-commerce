(function bootstrapAdminApp(global) {
  const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const ORDER_STATUS_FLOW = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  const state = {
    activeTab: 'dashboard',
    summary: null,
    orders: [],
    products: [],
    productOptions: [],
    categories: [],
    expenses: [],
    schedules: [],
    settings: null,
    selectedOrderId: null,
    selectedProductId: null,
    selectedProductName: '',
    isProductEditorOpen: false,
    productEditorMode: 'create',
    isProductOptionsOpen: false
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
    refreshDashboardButton: document.getElementById('refreshDashboardButton'),
    dashboardSummary: document.getElementById('dashboardSummary'),
    refreshOrdersButton: document.getElementById('refreshOrdersButton'),
    ordersList: document.getElementById('ordersList'),
    orderDetailCard: document.getElementById('orderDetailCard'),
    orderDetailTitle: document.getElementById('orderDetailTitle'),
    orderDetailBody: document.getElementById('orderDetailBody'),
    openNewProductButton: document.getElementById('openNewProductButton'),
    productEditorCard: document.getElementById('productEditorCard'),
    productEditorTitle: document.getElementById('productEditorTitle'),
    productSubmitButton: document.getElementById('productSubmitButton'),
    cancelProductEditButton: document.getElementById('cancelProductEditButton'),
    productForm: document.getElementById('productForm'),
    productId: document.getElementById('productId'),
    productCategoryId: document.getElementById('productCategoryId'),
    productName: document.getElementById('productName'),
    productDescription: document.getElementById('productDescription'),
    productPrice: document.getElementById('productPrice'),
    productImageUrl: document.getElementById('productImageUrl'),
    productImageFile: document.getElementById('productImageFile'),
    uploadProductImageButton: document.getElementById('uploadProductImageButton'),
    productImagePreview: document.getElementById('productImagePreview'),
    productImagePreviewImg: document.getElementById('productImagePreviewImg'),
    productImagePreviewText: document.getElementById('productImagePreviewText'),
    productStock: document.getElementById('productStock'),
    productIsActive: document.getElementById('productIsActive'),
    productsList: document.getElementById('productsList'),
    resetProductFormButton: document.getElementById('resetProductFormButton'),
    productOptionForm: document.getElementById('productOptionForm'),
    productOptionId: document.getElementById('productOptionId'),
    productOptionName: document.getElementById('productOptionName'),
    productOptionDescription: document.getElementById('productOptionDescription'),
    productOptionPriceModifier: document.getElementById('productOptionPriceModifier'),
    productOptionIsRequired: document.getElementById('productOptionIsRequired'),
    productOptionIsActive: document.getElementById('productOptionIsActive'),
    productOptionContext: document.getElementById('productOptionContext'),
    productOptionsCard: document.getElementById('productOptionsCard'),
    productOptionsTitle: document.getElementById('productOptionsTitle'),
    closeProductOptionsButton: document.getElementById('closeProductOptionsButton'),
    productOptionsList: document.getElementById('productOptionsList'),
    resetProductOptionFormButton: document.getElementById('resetProductOptionFormButton'),
    expenseForm: document.getElementById('expenseForm'),
    expenseId: document.getElementById('expenseId'),
    expenseTitle: document.getElementById('expenseTitle'),
    expenseCategory: document.getElementById('expenseCategory'),
    expenseAmount: document.getElementById('expenseAmount'),
    expenseDate: document.getElementById('expenseDate'),
    expenseDescription: document.getElementById('expenseDescription'),
    expensesList: document.getElementById('expensesList'),
    expensesSummaryAmount: document.getElementById('expensesSummaryAmount'),
    resetExpenseFormButton: document.getElementById('resetExpenseFormButton'),
    categoryForm: document.getElementById('categoryForm'),
    categoryId: document.getElementById('categoryId'),
    categoryName: document.getElementById('categoryName'),
    categoryDescription: document.getElementById('categoryDescription'),
    categoryIsActive: document.getElementById('categoryIsActive'),
    categoriesList: document.getElementById('categoriesList'),
    resetCategoryFormButton: document.getElementById('resetCategoryFormButton'),
    scheduleForm: document.getElementById('scheduleForm'),
    scheduleId: document.getElementById('scheduleId'),
    scheduleDayOfWeek: document.getElementById('scheduleDayOfWeek'),
    scheduleStartTime: document.getElementById('scheduleStartTime'),
    scheduleEndTime: document.getElementById('scheduleEndTime'),
    scheduleFulfillmentType: document.getElementById('scheduleFulfillmentType'),
    scheduleIsActive: document.getElementById('scheduleIsActive'),
    schedulesList: document.getElementById('schedulesList'),
    resetScheduleFormButton: document.getElementById('resetScheduleFormButton'),
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

  function showToast(type, message) {
    if (global.Toast && typeof global.Toast[type] === 'function') {
      global.Toast[type](message);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getStatusLabel(status) {
    return global.UiLabels ? global.UiLabels.orderStatus(status) : status;
  }

  function getFulfillmentLabel(type) {
    return global.UiLabels ? global.UiLabels.fulfillmentType(type) : type;
  }

  function getBooleanStatusLabel(value) {
    return global.UiLabels ? global.UiLabels.booleanStatus(Boolean(value)) : (value ? 'Activo' : 'Inactivo');
  }

  function formatMoney(value) {
    const amount = Number.parseFloat(value) || 0;
    const currency = state.settings && state.settings.currency_symbol ? state.settings.currency_symbol : 'ARS';

    if (/^[A-Z]{3}$/.test(currency)) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
      }).format(amount);
    }

    return currency + ' ' + new Intl.NumberFormat('es-AR').format(amount);
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  function formatShortDate(value) {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short'
    }).format(new Date(value));
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

  function renderEmpty(container, message) {
    container.innerHTML = '<article class="list-card"><p class="muted">' + escapeHtml(message) + '</p></article>';
  }

  function setButtonLoading(button, isLoading, loadingText, defaultText) {
    if (!button) {
      return;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : defaultText;
  }

  function scrollToElement(element) {
    if (!element || typeof element.scrollIntoView !== 'function') {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  function syncProductEditorUi() {
    elements.productEditorCard.classList.toggle('is-hidden', !state.isProductEditorOpen);
    elements.productEditorCard.classList.toggle('is-editing', state.productEditorMode === 'edit');
    elements.productEditorTitle.textContent = state.productEditorMode === 'edit' ? 'Editar producto' : 'Nuevo producto';
    elements.productSubmitButton.textContent = state.productEditorMode === 'edit' ? 'Guardar cambios' : 'Crear producto';
  }

  function openProductEditor(mode) {
    state.isProductEditorOpen = true;
    state.productEditorMode = mode;
    syncProductEditorUi();
    scrollToElement(elements.productEditorCard);
  }

  function closeProductEditor() {
    state.isProductEditorOpen = false;
    state.productEditorMode = 'create';
    syncProductEditorUi();
  }

  function syncProductOptionsUi() {
    elements.productOptionsCard.classList.toggle('is-hidden', !state.isProductOptionsOpen);
    elements.productOptionsTitle.textContent = state.selectedProductName
      ? 'Opciones de: ' + state.selectedProductName
      : 'Opciones del producto';
  }

  function openProductOptionsManager() {
    state.isProductOptionsOpen = true;
    syncProductOptionsUi();
    scrollToElement(elements.productOptionsCard);
  }

  function closeProductOptionsManager() {
    state.isProductOptionsOpen = false;
    state.selectedProductId = null;
    state.selectedProductName = '';
    state.productOptions = [];
    resetProductOptionForm();
    elements.productOptionContext.textContent = 'Selecciona un producto para gestionar sus opciones.';
    syncProductOptionsUi();
    renderProductOptions();
  }

  function updateProductImagePreview() {
    const imageUrl = elements.productImageUrl.value.trim();
    const hasImage = imageUrl !== '';

    elements.productImagePreview.classList.toggle('is-empty', !hasImage);
    elements.productImagePreviewImg.hidden = !hasImage;
    elements.productImagePreviewText.hidden = hasImage;

    if (hasImage) {
      elements.productImagePreviewImg.src = imageUrl;
    } else {
      elements.productImagePreviewImg.removeAttribute('src');
    }
  }

  function resetCategoryForm() {
    elements.categoryForm.reset();
    elements.categoryId.value = '';
    elements.categoryIsActive.checked = true;
  }

  function resetProductOptionForm() {
    elements.productOptionForm.reset();
    elements.productOptionId.value = '';
    elements.productOptionIsActive.checked = true;
    elements.productOptionIsRequired.checked = false;
  }

  function resetProductForm() {
    elements.productForm.reset();
    elements.productId.value = '';
    elements.productIsActive.checked = true;
    elements.productCategoryId.value = '';
    updateProductImagePreview();
    setButtonLoading(elements.uploadProductImageButton, false, 'Subiendo...', 'Subir imagen');
    elements.productImageFile.value = '';
  }

  function resetExpenseForm() {
    elements.expenseForm.reset();
    elements.expenseId.value = '';
    elements.expenseDate.value = new Date().toISOString().slice(0, 10);
  }

  function resetScheduleForm() {
    elements.scheduleForm.reset();
    elements.scheduleId.value = '';
    elements.scheduleIsActive.checked = true;
    elements.scheduleDayOfWeek.value = '0';
    elements.scheduleFulfillmentType.value = 'delivery';
  }

  function populateCategorySelect() {
    const options = ['<option value="">Sin categoria</option>'].concat(
      state.categories.map(function toOption(category) {
        return '<option value="' + category.id + '">' + escapeHtml(category.name) + '</option>';
      })
    );

    elements.productCategoryId.innerHTML = options.join('');
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

  function renderStatusOptions(selectedStatus) {
    return ORDER_STATUS_FLOW.map(function toOption(status) {
      const selected = status === selectedStatus ? ' selected' : '';
      return '<option value="' + status + '"' + selected + '>' + escapeHtml(getStatusLabel(status)) + '</option>';
    }).join('');
  }

  function renderDashboardSummary() {
    if (!state.summary) {
      renderEmpty(elements.dashboardSummary, 'Todavia no hay datos para mostrar.');
      return;
    }

    const cards = [
      { label: 'Pedidos hoy', value: state.summary.orders_today },
      { label: 'Ventas hoy', value: formatMoney(state.summary.sales_today) },
      { label: 'Ventas semana', value: formatMoney(state.summary.sales_week) },
      { label: 'Pedidos pendientes', value: state.summary.pending_orders },
      { label: 'Productos activos', value: state.summary.active_products },
      { label: 'Gastos semana', value: formatMoney(state.summary.expenses_week) },
      { label: 'Ganancia estimada', value: formatMoney(state.summary.estimated_profit_week) }
    ];

    elements.dashboardSummary.innerHTML = cards.map(function toCard(card) {
      return '<article class="kpi-card"><p>' + escapeHtml(card.label) + '</p><strong>' + escapeHtml(String(card.value)) + '</strong></article>';
    }).join('');
  }

  function renderOrders() {
    if (state.orders.length === 0) {
      renderEmpty(elements.ordersList, 'Todavia no hay pedidos.');
      return;
    }

    elements.ordersList.innerHTML = state.orders.map(function toOrderCard(order) {
      const scheduleInfo = [order.fulfillment_day, order.fulfillment_time_range].filter(Boolean).join(' · ') || 'Sin horario';

      return [
        '<article class="order-card">',
        '  <div class="order-card__header">',
        '    <div>',
        '      <strong>#' + order.id + ' · ' + escapeHtml(order.customer_name) + '</strong>',
        '      <div class="order-meta">',
        '        <span>' + escapeHtml(order.customer_phone) + ' · ' + escapeHtml(getFulfillmentLabel(order.delivery_type)) + '</span>',
        '        <span>' + escapeHtml(scheduleInfo) + '</span>',
        '        <span>' + escapeHtml(formatDate(order.created_at)) + '</span>',
        '      </div>',
        '    </div>',
        '    <span class="status-chip">' + escapeHtml(getStatusLabel(order.status)) + '</span>',
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

  function renderOrderDetailPlaceholder() {
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
      renderEmpty(elements.productsList, 'No hay productos cargados.');
      return;
    }

    elements.productsList.innerHTML = state.products.map(function toCard(product) {
      const optionsCount = Array.isArray(product.options) ? product.options.length : 0;
      const media = product.image_url ? '<img src="' + escapeHtml(product.image_url) + '" alt="' + escapeHtml(product.name) + '" />' : '<span>Sin imagen</span>';

      return [
        '<article class="list-card product-admin-card">',
        '  <div class="product-admin-card__media">' + media + '</div>',
        '  <div class="product-admin-card__body">',
        '    <div class="list-row">',
        '      <div>',
        '        <strong>' + escapeHtml(product.name) + '</strong>',
        '        <div class="list-meta">',
        '          <span>' + escapeHtml(product.category_name || 'Sin categoria') + '</span>',
        '          <span>' + escapeHtml(formatMoney(product.price)) + ' · Stock: ' + escapeHtml(product.stock == null ? 'N/D' : product.stock) + '</span>',
        '          <span>' + escapeHtml(optionsCount + ' opcion' + (optionsCount === 1 ? '' : 'es') + ' disponibles') + '</span>',
        '        </div>',
        '      </div>',
        '      <span class="status-chip">' + escapeHtml(getBooleanStatusLabel(product.is_active)) + '</span>',
        '    </div>',
        '    <div class="card-actions admin-product-actions">',
        '      <button class="status-action admin-product-action-btn" type="button" data-edit-product="' + product.id + '">Editar</button>',
        '      <button class="status-action admin-product-action-btn" type="button" data-manage-options="' + product.id + '">Opciones</button>',
        '      <button class="status-action admin-product-action-btn" type="button" data-delete-product="' + product.id + '">Desactivar</button>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderProductOptions() {
    syncProductOptionsUi();

    if (!state.isProductOptionsOpen || !state.selectedProductId) {
      renderEmpty(elements.productOptionsList, 'Selecciona un producto para gestionar sus opciones.');
      return;
    }

    if (state.productOptions.length === 0) {
      renderEmpty(elements.productOptionsList, 'No hay opciones cargadas para este producto.');
      return;
    }

    elements.productOptionsList.innerHTML = state.productOptions.map(function toCard(option) {
      return [
        '<article class="list-card">',
        '  <div class="list-row">',
        '    <div>',
        '      <strong>' + escapeHtml(option.name) + '</strong>',
        '      <div class="list-meta">',
        '        <span>' + escapeHtml(option.description || 'Sin descripcion') + '</span>',
        '        <span>' + escapeHtml(formatMoney(option.price_modifier)) + ' · ' + escapeHtml(option.is_required ? 'Requerida' : 'Opcional') + '</span>',
        '      </div>',
        '    </div>',
        '    <span class="status-chip">' + escapeHtml(getBooleanStatusLabel(option.is_active)) + '</span>',
        '  </div>',
        '  <div class="card-actions">',
        '    <button class="status-action" type="button" data-edit-option="' + option.id + '">Editar</button>',
        '    <button class="status-action" type="button" data-delete-option="' + option.id + '">Desactivar</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderExpenses() {
    elements.expensesSummaryAmount.textContent = state.summary ? formatMoney(state.summary.expenses_week) : formatMoney(0);

    if (state.expenses.length === 0) {
      renderEmpty(elements.expensesList, 'No hay gastos cargados.');
      return;
    }

    elements.expensesList.innerHTML = state.expenses.map(function toExpenseCard(expense) {
      return [
        '<article class="list-card">',
        '  <div class="list-row">',
        '    <div>',
        '      <strong>' + escapeHtml(expense.title) + '</strong>',
        '      <div class="list-meta">',
        '        <span>' + escapeHtml(expense.category || 'Sin categoria') + '</span>',
        '        <span>' + escapeHtml(formatShortDate(expense.expense_date)) + '</span>',
        '        <span>' + escapeHtml(expense.description || 'Sin descripcion') + '</span>',
        '      </div>',
        '    </div>',
        '    <strong>' + escapeHtml(formatMoney(expense.amount)) + '</strong>',
        '  </div>',
        '  <div class="card-actions">',
        '    <button class="status-action" type="button" data-edit-expense="' + expense.id + '">Editar</button>',
        '    <button class="status-action" type="button" data-delete-expense="' + expense.id + '">Eliminar</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderCategories() {
    if (state.categories.length === 0) {
      renderEmpty(elements.categoriesList, 'No hay categorias cargadas.');
      return;
    }

    elements.categoriesList.innerHTML = state.categories.map(function toCard(category) {
      return [
        '<article class="list-card">',
        '  <div class="list-row">',
        '    <div>',
        '      <strong>' + escapeHtml(category.name) + '</strong>',
        '      <div class="list-meta"><span>' + escapeHtml(category.description || 'Sin descripcion') + '</span></div>',
        '    </div>',
        '    <span class="status-chip">' + escapeHtml(getBooleanStatusLabel(category.is_active)) + '</span>',
        '  </div>',
        '  <div class="card-actions">',
        '    <button class="status-action" type="button" data-edit-category="' + category.id + '">Editar</button>',
        '    <button class="status-action" type="button" data-delete-category="' + category.id + '">Desactivar</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderSchedules() {
    if (state.schedules.length === 0) {
      renderEmpty(elements.schedulesList, 'No hay horarios configurados.');
      return;
    }

    elements.schedulesList.innerHTML = state.schedules.map(function toCard(schedule) {
      return [
        '<article class="list-card">',
        '  <div class="list-row">',
        '    <div>',
        '      <strong>' + escapeHtml(DAY_NAMES[schedule.day_of_week] || schedule.day_of_week) + '</strong>',
        '      <div class="list-meta">',
        '        <span>' + escapeHtml(String(schedule.start_time).slice(0, 5) + ' - ' + String(schedule.end_time).slice(0, 5)) + '</span>',
        '        <span>' + escapeHtml(getFulfillmentLabel(schedule.fulfillment_type)) + '</span>',
        '      </div>',
        '    </div>',
        '    <span class="status-chip">' + escapeHtml(getBooleanStatusLabel(schedule.is_active)) + '</span>',
        '  </div>',
        '  <div class="card-actions">',
        '    <button class="status-action" type="button" data-edit-schedule="' + schedule.id + '">Editar</button>',
        '    <button class="status-action" type="button" data-delete-schedule="' + schedule.id + '">Desactivar</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  async function loadOrderDetail(orderId) {
    try {
      const detail = await global.AdminApi.getOrderById(orderId);

      elements.orderDetailCard.classList.remove('is-hidden');
      elements.orderDetailTitle.textContent = 'Pedido #' + detail.id;
      elements.orderDetailBody.innerHTML = [
        '<div><strong>Cliente:</strong> ' + escapeHtml(detail.customer_name) + '</div>',
        '<div><strong>Telefono:</strong> ' + escapeHtml(detail.customer_phone) + '</div>',
        '<div><strong>Entrega:</strong> ' + escapeHtml(getFulfillmentLabel(detail.delivery_type)) + '</div>',
        '<div><strong>Direccion:</strong> ' + escapeHtml(detail.address || '-') + '</div>',
        '<div><strong>Dia:</strong> ' + escapeHtml(detail.fulfillment_day || '-') + '</div>',
        '<div><strong>Horario:</strong> ' + escapeHtml(detail.fulfillment_time_range || '-') + '</div>',
        '<div><strong>Estado:</strong> ' + escapeHtml(getStatusLabel(detail.status)) + '</div>',
        '<div><strong>Observaciones:</strong> ' + escapeHtml(detail.notes || '-') + '</div>',
        '<div><strong>Total:</strong> ' + escapeHtml(formatMoney(detail.total)) + '</div>',
        '<div><strong>Items:</strong></div>',
        '<ul>' + detail.items.map(function toItem(item) {
          const optionLabel = item.product_option_name ? ' [' + item.product_option_name + ']' : '';
          return '<li>' + escapeHtml(item.quantity + ' x ' + item.product_name + optionLabel + ' · ' + formatMoney(item.subtotal)) + '</li>';
        }).join('') + '</ul>'
      ].join('');
    } catch (error) {
      handleApiError(error);
    }
  }

  async function loadData() {
    try {
      const data = await Promise.all([
        global.AdminApi.getDashboardSummary(),
        global.AdminApi.getOrders(),
        global.AdminApi.getProducts(),
        global.AdminApi.getCategories(),
        global.AdminApi.getSettings(),
        global.AdminApi.getFulfillmentSchedules(),
        global.AdminApi.getExpenses()
      ]);

      state.summary = data[0];
      state.orders = data[1];
      state.products = data[2];
      state.categories = data[3];
      state.settings = data[4];
      state.schedules = data[5];
      state.expenses = data[6];
      state.productOptions = state.selectedProductId && state.isProductOptionsOpen
        ? await global.AdminApi.getProductOptions(state.selectedProductId)
        : [];

      populateCategorySelect();
      fillSettingsForm();
      renderDashboardSummary();
      renderOrders();
      renderProducts();
      renderProductOptions();
      renderExpenses();
      renderCategories();
      renderSchedules();
      renderOrderDetailPlaceholder();
      updateProductImagePreview();
      setMessage('Panel actualizado.');
    } catch (error) {
      handleApiError(error);
    }
  }

  function handleApiError(error) {
    console.error(error);

    if (error && error.status === 401) {
      global.AdminAuth.clearSession();
      setAuthState(false);
      setLoginMessage('Tu sesion vencio o el token no es valido.');
      showToast('error', 'Tu sesion vencio. Vuelve a iniciar sesion.');
      return;
    }

    const message = error && error.message ? error.message : 'Ocurrio un error inesperado.';
    setMessage(message);
    showToast('error', message);
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setButtonLoading(elements.loginButton, true, 'Ingresando...', 'Ingresar');
      setLoginMessage('Validando credenciales...');

      const result = await global.AdminApi.login({
        username: elements.loginUsername.value.trim(),
        password: elements.loginPassword.value
      });

      global.AdminAuth.setSession(result.token, result.user);
      setAuthState(true);
      setLoginMessage('');
      elements.loginForm.reset();
      await loadData();
      showToast('success', 'Sesion iniciada correctamente.');
    } catch (error) {
      console.error(error);
      const message = error && error.message ? error.message : 'No se pudo iniciar sesion.';
      setLoginMessage(message);
      showToast('error', message);
    } finally {
      setButtonLoading(elements.loginButton, false, 'Ingresando...', 'Ingresar');
    }
  }

  function handleLogout() {
    global.AdminAuth.clearSession();
    setAuthState(false);
    setMessage('');
    setLoginMessage('Sesion cerrada.');
    showToast('info', 'Sesion cerrada.');
  }

  function handleTabAction(event) {
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
      renderOrderDetailPlaceholder();
      await loadOrderDetail(state.selectedOrderId);
    }

    if (cancelButton) {
      try {
        await global.AdminApi.cancelOrder(Number.parseInt(cancelButton.getAttribute('data-cancel-order'), 10));
        await loadData();
        showToast('warning', 'Pedido cancelado.');
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
      await loadData();
      showToast('success', 'Estado del pedido actualizado.');
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
        showToast('success', 'Producto actualizado.');
      } else {
        await global.AdminApi.createProduct(payload);
        showToast('success', 'Producto creado.');
      }

      resetProductForm();
      closeProductEditor();
      await loadData();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleProductImageUpload() {
    const selectedFile = elements.productImageFile.files && elements.productImageFile.files[0];

    if (!selectedFile) {
      showToast('warning', 'Selecciona una imagen antes de subirla.');
      return;
    }

    try {
      setButtonLoading(elements.uploadProductImageButton, true, 'Subiendo...', 'Subir imagen');

      const response = await global.AdminApi.uploadProductImage(selectedFile);

      elements.productImageUrl.value = response.image_url || '';
      updateProductImagePreview();
      showToast('success', 'Imagen subida correctamente.');
    } catch (error) {
      handleApiError(error);
    } finally {
      setButtonLoading(elements.uploadProductImageButton, false, 'Subiendo...', 'Subir imagen');
    }
  }

  async function handleProductsListClick(event) {
    const editButton = event.target.closest('[data-edit-product]');
    const optionsButton = event.target.closest('[data-manage-options]');
    const deleteButton = event.target.closest('[data-delete-product]');

    if (editButton) {
      try {
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
        updateProductImagePreview();
        openProductEditor('edit');
        setActiveTab('products');
        setMessage('Editando producto #' + product.id + '.');
        showToast('info', 'Editando producto: ' + product.name);
      } catch (error) {
        handleApiError(error);
      }
    }

    if (optionsButton) {
      try {
        const productId = Number.parseInt(optionsButton.getAttribute('data-manage-options'), 10);
        const product = await global.AdminApi.getProductById(productId);

        state.selectedProductId = product.id;
        state.selectedProductName = product.name || '';
        state.productOptions = await global.AdminApi.getProductOptions(product.id);
        elements.productOptionContext.textContent = 'Opciones para "' + product.name + '".';
        resetProductOptionForm();
        openProductOptionsManager();
        renderProductOptions();
        showToast('info', 'Gestionando opciones de: ' + product.name);
      } catch (error) {
        handleApiError(error);
      }
    }

    if (deleteButton) {
      try {
        await global.AdminApi.deleteProduct(Number.parseInt(deleteButton.getAttribute('data-delete-product'), 10));
        await loadData();
        showToast('warning', 'Producto desactivado.');
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  async function handleProductOptionSubmit(event) {
    event.preventDefault();

    if (!state.selectedProductId) {
      const message = 'Primero selecciona un producto para cargar opciones.';
      setMessage(message);
      showToast('warning', message);
      return;
    }

    const payload = {
      name: elements.productOptionName.value.trim(),
      description: elements.productOptionDescription.value.trim(),
      price_modifier: Number(elements.productOptionPriceModifier.value || 0),
      is_required: elements.productOptionIsRequired.checked,
      is_active: elements.productOptionIsActive.checked
    };

    try {
      if (elements.productOptionId.value) {
        await global.AdminApi.updateProductOption(Number.parseInt(elements.productOptionId.value, 10), payload);
        showToast('success', 'Opcion actualizada.');
      } else {
        await global.AdminApi.createProductOption(state.selectedProductId, payload);
        showToast('success', 'Opcion creada.');
      }

      resetProductOptionForm();
      state.productOptions = await global.AdminApi.getProductOptions(state.selectedProductId);
      renderProductOptions();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleProductOptionsListClick(event) {
    const editButton = event.target.closest('[data-edit-option]');
    const deleteButton = event.target.closest('[data-delete-option]');

    if (editButton) {
      const optionId = Number.parseInt(editButton.getAttribute('data-edit-option'), 10);
      const option = state.productOptions.find(function findOption(item) {
        return item.id === optionId;
      });

      if (!option) {
        return;
      }

      elements.productOptionId.value = option.id;
      elements.productOptionName.value = option.name || '';
      elements.productOptionDescription.value = option.description || '';
      elements.productOptionPriceModifier.value = option.price_modifier || 0;
      elements.productOptionIsRequired.checked = Boolean(option.is_required);
      elements.productOptionIsActive.checked = Boolean(option.is_active);
      setMessage('Editando opcion #' + option.id + '.');
    }

    if (deleteButton) {
      try {
        await global.AdminApi.deleteProductOption(Number.parseInt(deleteButton.getAttribute('data-delete-option'), 10));
        state.productOptions = await global.AdminApi.getProductOptions(state.selectedProductId);
        renderProductOptions();
        showToast('warning', 'Opcion desactivada.');
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault();

    const payload = {
      title: elements.expenseTitle.value.trim(),
      category: elements.expenseCategory.value.trim() || null,
      amount: Number(elements.expenseAmount.value),
      expense_date: elements.expenseDate.value,
      description: elements.expenseDescription.value.trim() || null
    };

    try {
      if (elements.expenseId.value) {
        await global.AdminApi.updateExpense(Number.parseInt(elements.expenseId.value, 10), payload);
        showToast('success', 'Gasto actualizado.');
      } else {
        await global.AdminApi.createExpense(payload);
        showToast('success', 'Gasto registrado.');
      }

      resetExpenseForm();
      await loadData();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleExpensesListClick(event) {
    const editButton = event.target.closest('[data-edit-expense]');
    const deleteButton = event.target.closest('[data-delete-expense]');

    if (editButton) {
      try {
        const expense = await global.AdminApi.getExpenseById(Number.parseInt(editButton.getAttribute('data-edit-expense'), 10));
        elements.expenseId.value = expense.id;
        elements.expenseTitle.value = expense.title || '';
        elements.expenseCategory.value = expense.category || '';
        elements.expenseAmount.value = expense.amount || 0;
        elements.expenseDate.value = String(expense.expense_date).slice(0, 10);
        elements.expenseDescription.value = expense.description || '';
        setActiveTab('expenses');
        setMessage('Editando gasto #' + expense.id + '.');
      } catch (error) {
        handleApiError(error);
      }
    }

    if (deleteButton) {
      try {
        await global.AdminApi.deleteExpense(Number.parseInt(deleteButton.getAttribute('data-delete-expense'), 10));
        await loadData();
        showToast('warning', 'Gasto eliminado.');
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
        showToast('success', 'Categoria actualizada.');
      } else {
        await global.AdminApi.createCategory(payload);
        showToast('success', 'Categoria creada.');
      }

      resetCategoryForm();
      await loadData();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleCategoriesListClick(event) {
    const editButton = event.target.closest('[data-edit-category]');
    const deleteButton = event.target.closest('[data-delete-category]');

    if (editButton) {
      try {
        const category = await global.AdminApi.getCategoryById(Number.parseInt(editButton.getAttribute('data-edit-category'), 10));
        elements.categoryId.value = category.id;
        elements.categoryName.value = category.name || '';
        elements.categoryDescription.value = category.description || '';
        elements.categoryIsActive.checked = Boolean(category.is_active);
        setActiveTab('categories');
        setMessage('Editando categoria #' + category.id + '.');
      } catch (error) {
        handleApiError(error);
      }
    }

    if (deleteButton) {
      try {
        await global.AdminApi.deleteCategory(Number.parseInt(deleteButton.getAttribute('data-delete-category'), 10));
        await loadData();
        showToast('warning', 'Categoria desactivada.');
      } catch (error) {
        handleApiError(error);
      }
    }
  }

  async function handleScheduleSubmit(event) {
    event.preventDefault();

    const payload = {
      day_of_week: Number.parseInt(elements.scheduleDayOfWeek.value, 10),
      start_time: elements.scheduleStartTime.value,
      end_time: elements.scheduleEndTime.value,
      fulfillment_type: elements.scheduleFulfillmentType.value,
      is_active: elements.scheduleIsActive.checked
    };

    try {
      if (elements.scheduleId.value) {
        await global.AdminApi.updateFulfillmentSchedule(Number.parseInt(elements.scheduleId.value, 10), payload);
        showToast('success', 'Horario actualizado.');
      } else {
        await global.AdminApi.createFulfillmentSchedule(payload);
        showToast('success', 'Horario creado.');
      }

      resetScheduleForm();
      await loadData();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleSchedulesListClick(event) {
    const editButton = event.target.closest('[data-edit-schedule]');
    const deleteButton = event.target.closest('[data-delete-schedule]');

    if (editButton) {
      const scheduleId = Number.parseInt(editButton.getAttribute('data-edit-schedule'), 10);
      const schedule = state.schedules.find(function findSchedule(item) {
        return item.id === scheduleId;
      });

      if (!schedule) {
        return;
      }

      elements.scheduleId.value = schedule.id;
      elements.scheduleDayOfWeek.value = String(schedule.day_of_week);
      elements.scheduleStartTime.value = String(schedule.start_time).slice(0, 5);
      elements.scheduleEndTime.value = String(schedule.end_time).slice(0, 5);
      elements.scheduleFulfillmentType.value = schedule.fulfillment_type;
      elements.scheduleIsActive.checked = Boolean(schedule.is_active);
      setActiveTab('schedules');
      setMessage('Editando horario #' + schedule.id + '.');
    }

    if (deleteButton) {
      try {
        await global.AdminApi.deleteFulfillmentSchedule(Number.parseInt(deleteButton.getAttribute('data-delete-schedule'), 10));
        await loadData();
        showToast('warning', 'Horario desactivado.');
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

      await loadData();
      showToast('success', 'Configuracion actualizada.');
    } catch (error) {
      handleApiError(error);
    }
  }

  function attachEvents() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.logoutButton.addEventListener('click', handleLogout);
    elements.adminTabs.addEventListener('click', handleTabAction);
    elements.refreshDashboardButton.addEventListener('click', loadData);
    elements.refreshOrdersButton.addEventListener('click', loadData);
    elements.openNewProductButton.addEventListener('click', function openNewProductForm() {
      resetProductForm();
      openProductEditor('create');
      showToast('info', 'Crea un nuevo producto.');
    });
    elements.ordersList.addEventListener('click', handleOrdersListClick);
    elements.ordersList.addEventListener('change', handleOrdersListChange);
    elements.productForm.addEventListener('submit', handleProductSubmit);
    elements.productImageUrl.addEventListener('input', updateProductImagePreview);
    elements.uploadProductImageButton.addEventListener('click', handleProductImageUpload);
    elements.productsList.addEventListener('click', handleProductsListClick);
    elements.cancelProductEditButton.addEventListener('click', function cancelProductEdit() {
      resetProductForm();
      closeProductEditor();
      showToast('info', 'Edicion cancelada.');
    });
    elements.productOptionForm.addEventListener('submit', handleProductOptionSubmit);
    elements.productOptionsList.addEventListener('click', handleProductOptionsListClick);
    elements.resetProductOptionFormButton.addEventListener('click', resetProductOptionForm);
    elements.closeProductOptionsButton.addEventListener('click', function closeProductOptions() {
      closeProductOptionsManager();
      showToast('info', 'Cerraste la gestion de opciones.');
    });
    elements.expenseForm.addEventListener('submit', handleExpenseSubmit);
    elements.expensesList.addEventListener('click', handleExpensesListClick);
    elements.resetExpenseFormButton.addEventListener('click', resetExpenseForm);
    elements.categoryForm.addEventListener('submit', handleCategorySubmit);
    elements.categoriesList.addEventListener('click', handleCategoriesListClick);
    elements.resetCategoryFormButton.addEventListener('click', resetCategoryForm);
    elements.scheduleForm.addEventListener('submit', handleScheduleSubmit);
    elements.schedulesList.addEventListener('click', handleSchedulesListClick);
    elements.resetScheduleFormButton.addEventListener('click', resetScheduleForm);
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
  }

  async function init() {
    attachEvents();
    setActiveTab('dashboard');
    resetCategoryForm();
    resetProductForm();
    closeProductEditor();
    closeProductOptionsManager();
    resetExpenseForm();
    resetScheduleForm();

    if (global.AdminAuth.getToken()) {
      setAuthState(true);
      await loadData();
    } else {
      setAuthState(false);
    }
  }

  init();
})(window);
