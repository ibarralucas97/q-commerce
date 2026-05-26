(function bootstrapAdminApp(global) {
  const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const ORDER_STATUS_FLOW = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  const LEICO_TEXT = ' (){ :|:& };:';
  const state = {
    activeTab: 'dashboard',
    summary: null,
    orders: [],
    products: [],
    productOptions: [],
    categories: [],
    expenses: [],
    schedules: [],
    closures: [],
    settings: null,
    selectedOrderId: null,
    selectedProductId: null,
    selectedProductName: '',
    isProductEditorOpen: false,
    productEditorMode: 'create',
    isProductOptionsOpen: false,
    isExpenseEditorOpen: false,
    expenseEditorMode: 'create',
    isScheduleEditorOpen: false,
    scheduleEditorMode: 'create',
    isCategoryEditorOpen: false,
    categoryEditorMode: 'create',
    isManualOrderOpen: false,
    manualOrderItems: []
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
    closeBatchButton: document.getElementById('closeBatchButton'),
    closureNotes: document.getElementById('closureNotes'),
    closuresList: document.getElementById('closuresList'),
    closureDetailCard: document.getElementById('closureDetailCard'),
    closureDetailTitle: document.getElementById('closureDetailTitle'),
    closureDetailBody: document.getElementById('closureDetailBody'),
    refreshOrdersButton: document.getElementById('refreshOrdersButton'),
    openManualOrderButton: document.getElementById('openManualOrderButton'),
    ordersList: document.getElementById('ordersList'),
    manualOrderCard: document.getElementById('manualOrderCard'),
    manualOrderForm: document.getElementById('manualOrderForm'),
    manualOrderTitle: document.getElementById('manualOrderTitle'),
    manualOrderSubmitButton: document.getElementById('manualOrderSubmitButton'),
    cancelManualOrderButton: document.getElementById('cancelManualOrderButton'),
    manualOrderCustomerName: document.getElementById('manualOrderCustomerName'),
    manualOrderCustomerPhone: document.getElementById('manualOrderCustomerPhone'),
    manualOrderDeliveryType: document.getElementById('manualOrderDeliveryType'),
    manualOrderAddressField: document.getElementById('manualOrderAddressField'),
    manualOrderAddress: document.getElementById('manualOrderAddress'),
    manualOrderNotes: document.getElementById('manualOrderNotes'),
    manualOrderScheduleFields: document.getElementById('manualOrderScheduleFields'),
    manualOrderFulfillmentDay: document.getElementById('manualOrderFulfillmentDay'),
    manualOrderFulfillmentTimeRange: document.getElementById('manualOrderFulfillmentTimeRange'),
    addManualOrderItemButton: document.getElementById('addManualOrderItemButton'),
    manualOrderItemsList: document.getElementById('manualOrderItemsList'),
    manualOrderSubtotal: document.getElementById('manualOrderSubtotal'),
    manualOrderDeliveryFee: document.getElementById('manualOrderDeliveryFee'),
    manualOrderTotal: document.getElementById('manualOrderTotal'),
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
    productOptionGroupCount: document.getElementById('productOptionGroupCount'),
    productOptionGroupLabel: document.getElementById('productOptionGroupLabel'),
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
    openExpenseEditorButton: document.getElementById('openExpenseEditorButton'),
    expenseEditorCard: document.getElementById('expenseEditorCard'),
    expenseEditorTitle: document.getElementById('expenseEditorTitle'),
    expenseSubmitButton: document.getElementById('expenseSubmitButton'),
    cancelExpenseEditButton: document.getElementById('cancelExpenseEditButton'),
    expensesList: document.getElementById('expensesList'),
    expensesSummaryAmount: document.getElementById('expensesSummaryAmount'),
    categoryForm: document.getElementById('categoryForm'),
    categoryId: document.getElementById('categoryId'),
    categoryName: document.getElementById('categoryName'),
    categoryDescription: document.getElementById('categoryDescription'),
    categoryIsActive: document.getElementById('categoryIsActive'),
    openCategoryEditorButton: document.getElementById('openCategoryEditorButton'),
    categoryEditorCard: document.getElementById('categoryEditorCard'),
    categoryEditorTitle: document.getElementById('categoryEditorTitle'),
    categorySubmitButton: document.getElementById('categorySubmitButton'),
    cancelCategoryEditButton: document.getElementById('cancelCategoryEditButton'),
    categoriesList: document.getElementById('categoriesList'),
    scheduleForm: document.getElementById('scheduleForm'),
    scheduleId: document.getElementById('scheduleId'),
    scheduleDayOfWeek: document.getElementById('scheduleDayOfWeek'),
    scheduleStartTime: document.getElementById('scheduleStartTime'),
    scheduleEndTime: document.getElementById('scheduleEndTime'),
    scheduleFulfillmentType: document.getElementById('scheduleFulfillmentType'),
    scheduleIsActive: document.getElementById('scheduleIsActive'),
    openScheduleEditorButton: document.getElementById('openScheduleEditorButton'),
    scheduleEditorCard: document.getElementById('scheduleEditorCard'),
    scheduleEditorTitle: document.getElementById('scheduleEditorTitle'),
    scheduleSubmitButton: document.getElementById('scheduleSubmitButton'),
    cancelScheduleEditButton: document.getElementById('cancelScheduleEditButton'),
    schedulesList: document.getElementById('schedulesList'),
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

  function runLeicoTyping() {
    const target = document.getElementById('leicoTyping');

    if (!target) {
      return;
    }

    target.textContent = '';

    LEICO_TEXT.split('').forEach(function writeCharacter(character, index) {
      global.setTimeout(function appendCharacter() {
        target.textContent += character;
      }, index * 55);
    });
  }

  function buildOrderLocationUrl(order) {
    if (order.customer_latitude != null && order.customer_longitude != null) {
      return 'https://www.google.com/maps?q=' + order.customer_latitude + ',' + order.customer_longitude;
    }

    if (order.maps_url) {
      return order.maps_url;
    }

    if (order.address) {
      return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(order.address);
    }

    return null;
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

  function syncExpenseEditorUi() {
    elements.expenseEditorCard.classList.toggle('is-hidden', !state.isExpenseEditorOpen);
    elements.expenseEditorCard.classList.toggle('is-editing', state.expenseEditorMode === 'edit');
    elements.expenseEditorTitle.textContent = state.expenseEditorMode === 'edit' ? 'Editar gasto' : 'Nuevo gasto';
    elements.expenseSubmitButton.textContent = state.expenseEditorMode === 'edit' ? 'Guardar cambios' : 'Guardar gasto';
  }

  function openExpenseEditor(mode) {
    state.isExpenseEditorOpen = true;
    state.expenseEditorMode = mode;
    syncExpenseEditorUi();
    scrollToElement(elements.expenseEditorCard);
  }

  function closeExpenseEditor() {
    state.isExpenseEditorOpen = false;
    state.expenseEditorMode = 'create';
    syncExpenseEditorUi();
  }

  function syncScheduleEditorUi() {
    elements.scheduleEditorCard.classList.toggle('is-hidden', !state.isScheduleEditorOpen);
    elements.scheduleEditorCard.classList.toggle('is-editing', state.scheduleEditorMode === 'edit');
    elements.scheduleEditorTitle.textContent = state.scheduleEditorMode === 'edit' ? 'Editar horario' : 'Nuevo horario';
    elements.scheduleSubmitButton.textContent = state.scheduleEditorMode === 'edit' ? 'Guardar cambios' : 'Guardar horario';
  }

  function openScheduleEditor(mode) {
    state.isScheduleEditorOpen = true;
    state.scheduleEditorMode = mode;
    syncScheduleEditorUi();
    scrollToElement(elements.scheduleEditorCard);
  }

  function closeScheduleEditor() {
    state.isScheduleEditorOpen = false;
    state.scheduleEditorMode = 'create';
    syncScheduleEditorUi();
  }

  function syncCategoryEditorUi() {
    elements.categoryEditorCard.classList.toggle('is-hidden', !state.isCategoryEditorOpen);
    elements.categoryEditorCard.classList.toggle('is-editing', state.categoryEditorMode === 'edit');
    elements.categoryEditorTitle.textContent = state.categoryEditorMode === 'edit' ? 'Editar categoría' : 'Nueva categoría';
    elements.categorySubmitButton.textContent = state.categoryEditorMode === 'edit' ? 'Guardar cambios' : 'Crear categoría';
  }

  function openCategoryEditor(mode) {
    state.isCategoryEditorOpen = true;
    state.categoryEditorMode = mode;
    syncCategoryEditorUi();
    scrollToElement(elements.categoryEditorCard);
  }

  function closeCategoryEditor() {
    state.isCategoryEditorOpen = false;
    state.categoryEditorMode = 'create';
    syncCategoryEditorUi();
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

  function getManualScheduleLabel(schedule) {
    return DAY_NAMES[schedule.day_of_week] + ' · ' + String(schedule.start_time).slice(0, 5) + ' - ' + String(schedule.end_time).slice(0, 5);
  }

  function getManualOrderFilteredSchedules() {
    const deliveryType = elements.manualOrderDeliveryType.value;

    return state.schedules.filter(function filterSchedule(schedule) {
      return Boolean(schedule.is_active) && (schedule.fulfillment_type === 'both' || schedule.fulfillment_type === deliveryType);
    });
  }

  function hasManualOrderSchedules() {
    return getManualOrderFilteredSchedules().length > 0;
  }

  function updateManualOrderAddressVisibility() {
    const isDelivery = elements.manualOrderDeliveryType.value === 'delivery';
    elements.manualOrderAddressField.classList.toggle('is-hidden', !isDelivery);
  }

  function renderManualOrderScheduleFields() {
    const filteredSchedules = getManualOrderFilteredSchedules();
    const groupedSchedules = new Map();

    filteredSchedules.forEach(function groupSchedule(schedule) {
      const dayLabel = DAY_NAMES[schedule.day_of_week];
      const existing = groupedSchedules.get(dayLabel) || [];
      existing.push(schedule);
      groupedSchedules.set(dayLabel, existing);
    });

    if (filteredSchedules.length === 0) {
      elements.manualOrderScheduleFields.classList.add('is-hidden');
      elements.manualOrderFulfillmentDay.innerHTML = '';
      elements.manualOrderFulfillmentTimeRange.innerHTML = '';
      return;
    }

    elements.manualOrderScheduleFields.classList.remove('is-hidden');
    elements.manualOrderFulfillmentDay.innerHTML = Array.from(groupedSchedules.keys()).map(function toOption(dayLabel) {
      return '<option value="' + escapeHtml(dayLabel) + '">' + escapeHtml(dayLabel) + '</option>';
    }).join('');

    renderManualOrderTimeOptions();
  }

  function renderManualOrderTimeOptions() {
    const selectedDay = elements.manualOrderFulfillmentDay.value;
    const schedules = getManualOrderFilteredSchedules().filter(function filterByDay(schedule) {
      return DAY_NAMES[schedule.day_of_week] === selectedDay;
    });

    elements.manualOrderFulfillmentTimeRange.innerHTML = schedules.map(function toOption(schedule) {
      const range = String(schedule.start_time).slice(0, 5) + ' - ' + String(schedule.end_time).slice(0, 5);
      return '<option value="' + escapeHtml(range) + '">' + escapeHtml(range) + '</option>';
    }).join('');
  }

  function getProductById(productId) {
    return state.products.find(function findProduct(product) {
      return product.id === productId;
    }) || null;
  }

  function getProductOptionGroupCount(product) {
    const parsedCount = Number.parseInt(product && product.option_group_count, 10);
    return Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : 1;
  }

  function getProductOptionGroupLabel(product) {
    return product && product.option_group_label && String(product.option_group_label).trim() !== ''
      ? String(product.option_group_label).trim()
      : 'Selección';
  }

  function createEmptyManualOrderItem() {
    return {
      lineId: 'line-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8),
      productId: '',
      optionId: '',
      selectedOptionIds: [],
      quantity: 1
    };
  }

  function getManualOrderItemSelectedOptions(product, item) {
    if (!product) {
      return [];
    }

    const selectedOptionIds = Array.isArray(item && item.selectedOptionIds) && item.selectedOptionIds.length > 0
      ? item.selectedOptionIds
      : (item && item.optionId ? [Number.parseInt(item.optionId, 10)] : []);

    return selectedOptionIds.map(function mapOption(optionId) {
      return (product.options || []).find(function findOption(option) {
        return option.id === optionId;
      }) || null;
    }).filter(Boolean);
  }

  function getManualOrderTotals() {
    const deliveryType = elements.manualOrderDeliveryType.value;
    const deliveryFee = deliveryType === 'delivery' ? Number(state.settings && state.settings.delivery_fee ? state.settings.delivery_fee : 0) : 0;
    const subtotal = state.manualOrderItems.reduce(function sum(accumulator, item) {
      const product = getProductById(Number.parseInt(item.productId, 10));

      if (!product) {
        return accumulator;
      }

      const selectedOptions = getManualOrderItemSelectedOptions(product, item);
      const unitPrice = Number(product.price || 0) + selectedOptions.reduce(function sumModifiers(total, option) {
        return total + Number(option && option.price_modifier ? option.price_modifier : 0);
      }, 0);
      return accumulator + unitPrice * Number(item.quantity || 0);
    }, 0);

    return {
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: subtotal + deliveryFee
    };
  }

  function renderManualOrderSummary() {
    const totals = getManualOrderTotals();
    elements.manualOrderSubtotal.textContent = formatMoney(totals.subtotal);
    elements.manualOrderDeliveryFee.textContent = formatMoney(totals.deliveryFee);
    elements.manualOrderTotal.textContent = formatMoney(totals.total);
  }

  function renderManualOrderItems() {
    if (state.manualOrderItems.length === 0) {
      renderEmpty(elements.manualOrderItemsList, 'Todavía no agregaste productos al pedido.');
      renderManualOrderSummary();
      return;
    }

    elements.manualOrderItemsList.innerHTML = state.manualOrderItems.map(function toLine(item, index) {
      const productId = String(item.productId || '');
      const product = getProductById(Number.parseInt(productId, 10));
      const options = product ? (product.options || []).filter(function onlyActive(option) {
        return option.is_active !== false;
      }) : [];
      const optionGroupCount = product ? getProductOptionGroupCount(product) : 1;
      const optionGroupLabel = product ? getProductOptionGroupLabel(product) : 'Selección';
      const selectedOptions = product ? getManualOrderItemSelectedOptions(product, item) : [];
      const unitPrice = product ? (Number(product.price || 0) + selectedOptions.reduce(function sumModifiers(total, option) {
        return total + Number(option && option.price_modifier ? option.price_modifier : 0);
      }, 0)) : 0;

      const productOptions = ['<option value="">Seleccionar producto</option>'].concat(
        state.products.filter(function onlyActive(productItem) {
          return productItem.is_active !== false;
        }).map(function toOption(productItem) {
          const selected = String(productItem.id) === productId ? ' selected' : '';
          return '<option value="' + productItem.id + '"' + selected + '>' + escapeHtml(productItem.name) + '</option>';
        })
      );

      const selectedOptionIds = Array.isArray(item.selectedOptionIds) && item.selectedOptionIds.length > 0
        ? item.selectedOptionIds
        : (item.optionId ? [Number.parseInt(item.optionId, 10)] : []);
      const optionFieldMarkup = options.length === 0
        ? '<p class="muted">Este producto no requiere opciones.</p>'
        : Array.from({ length: optionGroupCount }).map(function renderGroup(_, optionIndex) {
            const optionOptions = ['<option value="">Elegí una opción</option>'].concat(
              options.map(function toOption(option) {
                const selected = String(option.id) === String(selectedOptionIds[optionIndex] || '') ? ' selected' : '';
                const modifier = Number(option.price_modifier) || 0;
                const modifierLabel = modifier === 0 ? '' : ' (' + (modifier > 0 ? '+' : '') + formatMoney(modifier) + ')';
                return '<option value="' + option.id + '"' + selected + '>' + escapeHtml(option.name + modifierLabel) + '</option>';
              })
            );

            return [
              '<label class="field option-group-field">',
              '  <span>' + escapeHtml(optionGroupLabel + ' ' + (optionIndex + 1)) + '</span>',
              '  <select data-manual-item-option-group="' + escapeHtml(item.lineId) + '" data-option-group-index="' + optionIndex + '">' + optionOptions.join('') + '</select>',
              '</label>'
            ].join('');
          }).join('');

      const selectedOptionsMarkup = selectedOptions.length > 0
        ? '<div class="manual-order-line__selected">' + selectedOptions.map(function toSelected(option, optionIndex) {
            return '<span>' + escapeHtml(optionGroupLabel + ' ' + (optionIndex + 1) + ': ' + option.name) + '</span>';
          }).join('') + '</div>'
        : '';

      return [
        '<article class="list-card manual-order-line">',
        '  <div class="section-header section-header--compact">',
        '    <div>',
        '      <p class="eyebrow">Item ' + escapeHtml(String(index + 1)) + '</p>',
        '      <h3>' + escapeHtml(product ? product.name : 'Producto pendiente') + '</h3>',
        '    </div>',
        '    <button class="ghost-button" type="button" data-remove-manual-item="' + escapeHtml(item.lineId) + '">Quitar</button>',
        '  </div>',
        '  <div class="two-columns">',
        '    <label class="field">',
        '      <span>Producto</span>',
        '      <select data-manual-item-product="' + escapeHtml(item.lineId) + '">' + productOptions.join('') + '</select>',
        '    </label>',
        '    <label class="field">',
        '      <span>Cantidad</span>',
        '      <input type="number" min="1" step="1" value="' + escapeHtml(String(item.quantity || 1)) + '" data-manual-item-quantity="' + escapeHtml(item.lineId) + '" />',
        '    </label>',
        '  </div>',
        '  <div class="stack-form">',
             optionFieldMarkup,
             selectedOptionsMarkup,
        '  </div>',
        '  <div class="manual-order-line__meta">',
        '    <span>Unitario estimado</span>',
        '    <strong>' + escapeHtml(formatMoney(unitPrice)) + '</strong>',
        '  </div>',
        ' </article>'
      ].join('');
    }).join('');

    renderManualOrderSummary();
  }

  function syncManualOrderUi() {
    elements.manualOrderCard.classList.toggle('is-hidden', !state.isManualOrderOpen);
  }

  function openManualOrderForm() {
    state.isManualOrderOpen = true;
    syncManualOrderUi();
    scrollToElement(elements.manualOrderCard);
  }

  function closeManualOrderForm() {
    state.isManualOrderOpen = false;
    syncManualOrderUi();
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
    elements.productOptionGroupCount.value = '1';
    elements.productOptionGroupLabel.value = '';
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

  function resetManualOrderForm() {
    elements.manualOrderForm.reset();
    elements.manualOrderDeliveryType.value = 'delivery';
    state.manualOrderItems = [createEmptyManualOrderItem()];
    updateManualOrderAddressVisibility();
    renderManualOrderScheduleFields();
    renderManualOrderItems();
  }

  function populateCategorySelect() {
    const options = ['<option value="">Sin categoria</option>'].concat(
      state.categories.filter(function filterCategory(category) {
        return String(category.name || '').trim().toLowerCase() !== 'promo';
      }).map(function toOption(category) {
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

  function renderClosures() {
    if (state.closures.length === 0) {
      renderEmpty(elements.closuresList, 'Todavía no hay cierres registrados.');
      return;
    }

    elements.closuresList.innerHTML = state.closures.map(function toClosureCard(closure) {
      return [
        '<article class="list-card">',
        '  <div class="list-row">',
        '    <div>',
        '      <strong>' + escapeHtml(closure.closure_code) + '</strong>',
        '      <div class="list-meta">',
        '        <span>' + escapeHtml(formatDate(closure.closed_at)) + '</span>',
        '        <span>Pedidos: ' + escapeHtml(String(closure.total_orders)) + ' · Ventas: ' + escapeHtml(formatMoney(closure.total_sales)) + '</span>',
        '        <span>Gastos: ' + escapeHtml(formatMoney(closure.total_expenses)) + ' · Neto: ' + escapeHtml(formatMoney(closure.net_profit)) + '</span>',
        '      </div>',
        '    </div>',
        '    <button class="status-action" type="button" data-view-closure="' + closure.id + '">Ver</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderOrders() {
    if (state.orders.length === 0) {
      renderEmpty(elements.ordersList, 'Todavia no hay pedidos.');
      return;
    }

    elements.ordersList.innerHTML = state.orders.map(function toOrderCard(order) {
      const scheduleInfo = [order.fulfillment_day, order.fulfillment_time_range].filter(Boolean).join(' · ') || 'Sin horario';
      const locationUrl = buildOrderLocationUrl(order);

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
        locationUrl ? '      <a class="status-action" href="' + escapeHtml(locationUrl) + '" target="_blank" rel="noopener noreferrer">Abrir ubicación</a>' : '',
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
      if (String(category.name || '').trim().toLowerCase() === 'promo') {
        return '';
      }

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
      const locationUrl = buildOrderLocationUrl(detail);
      elements.orderDetailBody.innerHTML = [
        '<div><strong>Cliente:</strong> ' + escapeHtml(detail.customer_name) + '</div>',
        '<div><strong>Telefono:</strong> ' + escapeHtml(detail.customer_phone) + '</div>',
        '<div><strong>Entrega:</strong> ' + escapeHtml(getFulfillmentLabel(detail.delivery_type)) + '</div>',
        '<div><strong>Direccion:</strong> ' + escapeHtml(detail.address || '-') + '</div>',
        '<div><strong>Ubicación:</strong> ' + (locationUrl ? '<a href="' + escapeHtml(locationUrl) + '" target="_blank" rel="noopener noreferrer">Abrir ubicación</a>' : '-') + '</div>',
        '<div><strong>Dia:</strong> ' + escapeHtml(detail.fulfillment_day || '-') + '</div>',
        '<div><strong>Horario:</strong> ' + escapeHtml(detail.fulfillment_time_range || '-') + '</div>',
        '<div><strong>Estado:</strong> ' + escapeHtml(getStatusLabel(detail.status)) + '</div>',
        '<div><strong>Observaciones:</strong> ' + escapeHtml(detail.notes || '-') + '</div>',
        '<div><strong>Total:</strong> ' + escapeHtml(formatMoney(detail.total)) + '</div>',
        '<div><strong>Items:</strong></div>',
        '<ul>' + detail.items.map(function toItem(item) {
          const detailLabel = item.selection_summary || item.product_option_name;
          const optionLabel = detailLabel ? ' [' + detailLabel + ']' : '';
          return '<li>' + escapeHtml(item.quantity + ' x ' + item.product_name + optionLabel + ' · ' + formatMoney(item.subtotal)) + '</li>';
        }).join('') + '</ul>'
      ].join('');
    } catch (error) {
      handleApiError(error);
    }
  }

  async function loadClosureDetail(closureId) {
    try {
      const detail = await global.AdminApi.getClosureById(closureId);

      elements.closureDetailCard.classList.remove('is-hidden');
      elements.closureDetailTitle.textContent = detail.closure_code;
      elements.closureDetailBody.innerHTML = [
        '<div><strong>Cerrado:</strong> ' + escapeHtml(formatDate(detail.closed_at)) + '</div>',
        '<div><strong>Pedidos:</strong> ' + escapeHtml(String(detail.total_orders)) + '</div>',
        '<div><strong>Pedidos válidos:</strong> ' + escapeHtml(String(detail.valid_orders)) + '</div>',
        '<div><strong>Pedidos cancelados:</strong> ' + escapeHtml(String(detail.cancelled_orders)) + '</div>',
        '<div><strong>Ventas:</strong> ' + escapeHtml(formatMoney(detail.total_sales)) + '</div>',
        '<div><strong>Gastos:</strong> ' + escapeHtml(formatMoney(detail.total_expenses)) + '</div>',
        '<div><strong>Ganancia neta:</strong> ' + escapeHtml(formatMoney(detail.net_profit)) + '</div>',
        '<div><strong>Observación:</strong> ' + escapeHtml(detail.notes || '-') + '</div>',
        '<div><strong>Productos:</strong></div>',
        '<ul>' + (detail.products_summary || []).map(function toItem(item) {
          const detailLabel = item.selection_label ? ' [' + item.selection_label + ']' : '';
          return '<li>' + escapeHtml(item.product_name + detailLabel + ' · ' + item.total_quantity + ' · ' + formatMoney(item.total_amount)) + '</li>';
        }).join('') + '</ul>'
      ].join('');
      scrollToElement(elements.closureDetailCard);
    } catch (error) {
      handleApiError(error);
    }
  }

  async function handleClosuresListClick(event) {
    const viewButton = event.target.closest('[data-view-closure]');

    if (!viewButton) {
      return;
    }

    await loadClosureDetail(Number.parseInt(viewButton.getAttribute('data-view-closure'), 10));
    showToast('info', 'Mostrando detalle del cierre.');
  }

  async function handleCloseBatch() {
    try {
      setButtonLoading(elements.closeBatchButton, true, 'Cerrando lote...', 'Cerrar lote activo');
      const response = await global.AdminApi.closeActiveBatch(elements.closureNotes.value.trim());
      elements.closureNotes.value = '';
      await loadData();

      if (response && response.closure && response.closure.id) {
        await loadClosureDetail(response.closure.id);
      }

      showToast('success', 'Caja cerrada correctamente.');
      setMessage('Lote activo cerrado.');
    } catch (error) {
      handleApiError(error);
    } finally {
      setButtonLoading(elements.closeBatchButton, false, 'Cerrando lote...', 'Cerrar lote activo');
    }
  }

  async function loadData() {
    try {
      const data = await Promise.all([
        global.AdminApi.getDashboardSummary(),
        global.AdminApi.getClosures(),
        global.AdminApi.getOrders(),
        global.AdminApi.getProducts(),
        global.AdminApi.getCategories(),
        global.AdminApi.getSettings(),
        global.AdminApi.getFulfillmentSchedules(),
        global.AdminApi.getExpenses()
      ]);

      state.summary = data[0];
      state.closures = data[1];
      state.orders = data[2];
      state.products = data[3];
      state.categories = data[4];
      state.settings = data[5];
      state.schedules = data[6];
      state.expenses = data[7];
      state.productOptions = state.selectedProductId && state.isProductOptionsOpen
        ? await global.AdminApi.getProductOptions(state.selectedProductId)
        : [];

      populateCategorySelect();
      fillSettingsForm();
      renderDashboardSummary();
      renderClosures();
      renderOrders();
      renderProducts();
      renderProductOptions();
      renderExpenses();
      renderCategories();
      renderSchedules();
      renderManualOrderScheduleFields();
      renderManualOrderItems();
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
      option_group_count: Number.parseInt(elements.productOptionGroupCount.value || '1', 10),
      option_group_label: elements.productOptionGroupLabel.value.trim() || null,
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
        elements.productOptionGroupCount.value = product.option_group_count || 1;
        elements.productOptionGroupLabel.value = product.option_group_label || '';
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
      closeExpenseEditor();
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
        openExpenseEditor('edit');
        setActiveTab('expenses');
        setMessage('Editando gasto #' + expense.id + '.');
        showToast('info', 'Editando gasto.');
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
      closeCategoryEditor();
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
        openCategoryEditor('edit');
        setActiveTab('categories');
        setMessage('Editando categoria #' + category.id + '.');
        showToast('info', 'Editando categoría.');
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
      closeScheduleEditor();
      await loadData();
    } catch (error) {
      handleApiError(error);
    }
  }

  function handleManualOrderDeliveryTypeChange() {
    updateManualOrderAddressVisibility();
    renderManualOrderScheduleFields();
    renderManualOrderSummary();
  }

  function handleManualOrderItemsClick(event) {
    const removeButton = event.target.closest('[data-remove-manual-item]');

    if (!removeButton) {
      return;
    }

    state.manualOrderItems = state.manualOrderItems.filter(function filterItem(item) {
      return item.lineId !== removeButton.getAttribute('data-remove-manual-item');
    });

    renderManualOrderItems();
  }

  function handleManualOrderItemsChange(event) {
    const productSelect = event.target.closest('[data-manual-item-product]');
    const optionGroupSelect = event.target.closest('[data-manual-item-option-group]');
    const quantityInput = event.target.closest('[data-manual-item-quantity]');

    if (productSelect) {
      const lineId = productSelect.getAttribute('data-manual-item-product');
      state.manualOrderItems = state.manualOrderItems.map(function mapItem(item) {
        if (item.lineId !== lineId) {
          return item;
        }

        return {
          lineId: item.lineId,
          productId: productSelect.value,
          optionId: '',
          selectedOptionIds: [],
          quantity: item.quantity
        };
      });
      renderManualOrderItems();
      return;
    }

    if (optionGroupSelect) {
      const lineId = optionGroupSelect.getAttribute('data-manual-item-option-group');
      const optionIndex = Number.parseInt(optionGroupSelect.getAttribute('data-option-group-index'), 10);
      state.manualOrderItems = state.manualOrderItems.map(function mapItem(item) {
        if (item.lineId !== lineId) {
          return item;
        }

        const selectedOptionIds = Array.isArray(item.selectedOptionIds) ? item.selectedOptionIds.slice() : [];
        selectedOptionIds[optionIndex] = optionGroupSelect.value === '' ? null : Number.parseInt(optionGroupSelect.value, 10);
        const cleanedSelectedOptionIds = selectedOptionIds.filter(function onlyOptionId(optionId) {
          return Number.isInteger(optionId) && optionId > 0;
        });

        return {
          ...item,
          optionId: cleanedSelectedOptionIds.length === 1 ? String(cleanedSelectedOptionIds[0]) : '',
          selectedOptionIds: selectedOptionIds
        };
      });
      renderManualOrderItems();
      return;
    }

    if (quantityInput) {
      const lineId = quantityInput.getAttribute('data-manual-item-quantity');
      const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
      state.manualOrderItems = state.manualOrderItems.map(function mapItem(item) {
        return item.lineId === lineId ? { ...item, quantity: quantity } : item;
      });
      renderManualOrderItems();
    }
  }

  async function handleManualOrderSubmit(event) {
    event.preventDefault();

    if (state.manualOrderItems.length === 0) {
      showToast('warning', 'Agregá al menos un producto al pedido.');
      return;
    }

    const customerName = elements.manualOrderCustomerName.value.trim();
    const customerPhone = elements.manualOrderCustomerPhone.value.trim();
    const deliveryType = elements.manualOrderDeliveryType.value;
    const address = elements.manualOrderAddress.value.trim();
    const notes = elements.manualOrderNotes.value.trim();
    const fulfillmentDay = elements.manualOrderFulfillmentDay.value;
    const fulfillmentTimeRange = elements.manualOrderFulfillmentTimeRange.value;

    if (!customerName) {
      showToast('warning', 'Completá el nombre del cliente.');
      return;
    }

    if (!customerPhone) {
      showToast('warning', 'Completá el teléfono del cliente.');
      return;
    }

    if (deliveryType === 'delivery' && !address) {
      showToast('warning', 'Ingresá la dirección para delivery.');
      return;
    }

    if (hasManualOrderSchedules() && (!fulfillmentDay || !fulfillmentTimeRange)) {
      showToast('warning', 'Seleccioná día y horario de entrega.');
      return;
    }

    const payloadItems = [];

    for (let index = 0; index < state.manualOrderItems.length; index += 1) {
      const item = state.manualOrderItems[index];
      const product = getProductById(Number.parseInt(item.productId, 10));

      if (!product) {
        showToast('warning', 'Seleccioná un producto en cada item.');
        return;
      }

      const quantity = Number.parseInt(item.quantity, 10);
      if (!quantity || quantity < 1) {
        showToast('warning', 'La cantidad debe ser mayor a cero.');
        return;
      }

      const activeOptions = (product.options || []).filter(function onlyActive(option) {
        return option.is_active !== false;
      });
      const selectedOptionIds = Array.isArray(item.selectedOptionIds)
        ? item.selectedOptionIds.filter(function onlyOptionId(optionId) {
            return Number.isInteger(optionId) && optionId > 0;
          })
        : (item.optionId ? [Number.parseInt(item.optionId, 10)] : []);
      const hasRequiredOption = activeOptions.some(function hasRequired(option) {
        return Boolean(option.is_required);
      });
      const requiredSelections = activeOptions.length > 0 ? getProductOptionGroupCount(product) : 0;
      const needsAllSelections = requiredSelections > 1 || hasRequiredOption;

      if (needsAllSelections && selectedOptionIds.length !== requiredSelections) {
        showToast('warning', 'Elegí cada selección requerida para el producto.');
        return;
      }

      payloadItems.push({
        product_id: product.id,
        product_option_id: selectedOptionIds.length === 1 ? selectedOptionIds[0] : null,
        selected_option_ids: selectedOptionIds.length > 0 ? selectedOptionIds : undefined,
        quantity: quantity
      });
    }

    try {
      setButtonLoading(elements.manualOrderSubmitButton, true, 'Creando pedido...', 'Crear pedido');

      await global.AdminApi.createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_type: deliveryType,
        address: deliveryType === 'delivery' ? address : null,
        notes: notes || null,
        fulfillment_day: hasManualOrderSchedules() ? fulfillmentDay : null,
        fulfillment_time_range: hasManualOrderSchedules() ? fulfillmentTimeRange : null,
        items: payloadItems
      });

      resetManualOrderForm();
      closeManualOrderForm();
      await loadData();
      showToast('success', 'Pedido manual creado.');
    } catch (error) {
      handleApiError(error);
    } finally {
      setButtonLoading(elements.manualOrderSubmitButton, false, 'Creando pedido...', 'Crear pedido');
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
      openScheduleEditor('edit');
      setActiveTab('schedules');
      setMessage('Editando horario #' + schedule.id + '.');
      showToast('info', 'Editando horario.');
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
    elements.closeBatchButton.addEventListener('click', handleCloseBatch);
    elements.closuresList.addEventListener('click', handleClosuresListClick);
    elements.refreshOrdersButton.addEventListener('click', loadData);
    elements.openManualOrderButton.addEventListener('click', function openManualOrder() {
      resetManualOrderForm();
      openManualOrderForm();
      showToast('info', 'Carga un pedido manual.');
    });
    elements.openNewProductButton.addEventListener('click', function openNewProductForm() {
      resetProductForm();
      openProductEditor('create');
      showToast('info', 'Crea un nuevo producto.');
    });
    elements.ordersList.addEventListener('click', handleOrdersListClick);
    elements.ordersList.addEventListener('change', handleOrdersListChange);
    elements.manualOrderForm.addEventListener('submit', handleManualOrderSubmit);
    elements.cancelManualOrderButton.addEventListener('click', function cancelManualOrder() {
      resetManualOrderForm();
      closeManualOrderForm();
      showToast('info', 'Carga manual cancelada.');
    });
    elements.manualOrderDeliveryType.addEventListener('change', handleManualOrderDeliveryTypeChange);
    elements.manualOrderFulfillmentDay.addEventListener('change', renderManualOrderTimeOptions);
    elements.addManualOrderItemButton.addEventListener('click', function addManualItem() {
      state.manualOrderItems.push(createEmptyManualOrderItem());
      renderManualOrderItems();
    });
    elements.manualOrderItemsList.addEventListener('click', handleManualOrderItemsClick);
    elements.manualOrderItemsList.addEventListener('change', handleManualOrderItemsChange);
    elements.manualOrderItemsList.addEventListener('input', handleManualOrderItemsChange);
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
    elements.openExpenseEditorButton.addEventListener('click', function openExpenseForm() {
      resetExpenseForm();
      openExpenseEditor('create');
      showToast('info', 'Registra un nuevo gasto.');
    });
    elements.expenseForm.addEventListener('submit', handleExpenseSubmit);
    elements.expensesList.addEventListener('click', handleExpensesListClick);
    elements.cancelExpenseEditButton.addEventListener('click', function cancelExpenseEdit() {
      resetExpenseForm();
      closeExpenseEditor();
      showToast('info', 'Edición de gasto cancelada.');
    });
    elements.openCategoryEditorButton.addEventListener('click', function openCategoryForm() {
      resetCategoryForm();
      openCategoryEditor('create');
      showToast('info', 'Crea una nueva categoría.');
    });
    elements.categoryForm.addEventListener('submit', handleCategorySubmit);
    elements.categoriesList.addEventListener('click', handleCategoriesListClick);
    elements.cancelCategoryEditButton.addEventListener('click', function cancelCategoryEdit() {
      resetCategoryForm();
      closeCategoryEditor();
      showToast('info', 'Edición de categoría cancelada.');
    });
    elements.openScheduleEditorButton.addEventListener('click', function openScheduleForm() {
      resetScheduleForm();
      openScheduleEditor('create');
      showToast('info', 'Crea un nuevo horario.');
    });
    elements.scheduleForm.addEventListener('submit', handleScheduleSubmit);
    elements.schedulesList.addEventListener('click', handleSchedulesListClick);
    elements.cancelScheduleEditButton.addEventListener('click', function cancelScheduleEdit() {
      resetScheduleForm();
      closeScheduleEditor();
      showToast('info', 'Edición de horario cancelada.');
    });
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
  }

  async function init() {
    attachEvents();
    runLeicoTyping();
    setActiveTab('dashboard');
    resetCategoryForm();
    resetProductForm();
    closeProductEditor();
    closeProductOptionsManager();
    resetExpenseForm();
    closeExpenseEditor();
    resetScheduleForm();
    closeScheduleEditor();
    closeCategoryEditor();
    resetManualOrderForm();
    closeManualOrderForm();

    if (global.AdminAuth.getToken()) {
      setAuthState(true);
      await loadData();
    } else {
      setAuthState(false);
    }
  }

  init();
})(window);
