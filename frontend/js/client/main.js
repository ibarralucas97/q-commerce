(function bootstrapClientApp(global) {
  const state = {
    settings: null,
    categories: [],
    products: [],
    fulfillmentSchedules: [],
    activeCategoryId: 'all',
    cartOpen: false,
    isSubmittingOrder: false,
    pendingProduct: null,
    selectedOptionIds: [],
    customerLocation: {
      latitude: null,
      longitude: null
    }
  };

  const elements = {
    hero: document.getElementById('hero'),
    brandLogo: document.getElementById('brandLogo'),
    brandInitials: document.getElementById('brandInitials'),
    storeName: document.getElementById('storeName'),
    storeDescription: document.getElementById('storeDescription'),
    storeLocation: document.getElementById('storeLocation'),
    deliverySummary: document.getElementById('deliverySummary'),
    productCount: document.getElementById('productCount'),
    categoryFilters: document.getElementById('categoryFilters'),
    catalogStatus: document.getElementById('catalogStatus'),
    productGrid: document.getElementById('productGrid'),
    cartPanel: document.getElementById('cartPanel'),
    cartItems: document.getElementById('cartItems'),
    emptyCartMessage: document.getElementById('emptyCartMessage'),
    subtotalAmount: document.getElementById('subtotalAmount'),
    deliveryAmount: document.getElementById('deliveryAmount'),
    totalAmount: document.getElementById('totalAmount'),
    checkoutForm: document.getElementById('checkoutForm'),
    customerName: document.getElementById('customerName'),
    customerPhone: document.getElementById('customerPhone'),
    customerAddress: document.getElementById('customerAddress'),
    customerMapsUrl: document.getElementById('customerMapsUrl'),
    customerNotes: document.getElementById('customerNotes'),
    detectLocationButton: document.getElementById('detectLocationButton'),
    locationStatus: document.getElementById('locationStatus'),
    fulfillmentDay: document.getElementById('fulfillmentDay'),
    fulfillmentTimeRange: document.getElementById('fulfillmentTimeRange'),
    scheduleFields: document.getElementById('scheduleFields'),
    addressField: document.getElementById('addressField'),
    checkoutHint: document.getElementById('checkoutHint'),
    checkoutButton: document.getElementById('checkoutButton'),
    floatingCartButton: document.getElementById('floatingCartButton'),
    floatingCartCount: document.getElementById('floatingCartCount'),
    closeCartButton: document.getElementById('closeCartButton'),
    optionModal: document.getElementById('optionModal'),
    optionModalBackdrop: document.getElementById('optionModalBackdrop'),
    optionModalTitle: document.getElementById('optionModalTitle'),
    optionModalDescription: document.getElementById('optionModalDescription'),
    optionList: document.getElementById('optionList'),
    optionModalHint: document.getElementById('optionModalHint'),
    confirmOptionButton: document.getElementById('confirmOptionButton'),
    closeOptionModalButton: document.getElementById('closeOptionModalButton')
  };
  const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const LEICO_TEXT = ' (){ :|:& };:';

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function showToast(type, message) {
    if (global.Toast && typeof global.Toast[type] === 'function') {
      global.Toast[type](message);
    }
  }

  function getStoreInitials(storeName) {
    if (!storeName) {
      return 'QC';
    }

    return storeName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function toInitial(word) {
        return word[0].toUpperCase();
      })
      .join('');
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

  function getSelectedDeliveryType() {
    const selectedOption = document.querySelector('input[name="deliveryType"]:checked');
    return selectedOption ? selectedOption.value : 'pickup';
  }

  function isDeliverySelected() {
    return getSelectedDeliveryType() === 'delivery';
  }

  function normalizeWhatsappNumber(value) {
    return String(value || '').replace(/\D/g, '');
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

  function setCartOpen(isOpen) {
    state.cartOpen = isOpen;
    elements.cartPanel.classList.toggle('is-open', isOpen);
    elements.floatingCartButton.classList.toggle('is-hidden', isOpen);
    document.body.classList.toggle('cart-open', isOpen);
  }

  function setCheckoutSubmitting(isSubmitting) {
    state.isSubmittingOrder = isSubmitting;
    elements.checkoutButton.disabled = isSubmitting;
    elements.checkoutButton.textContent = isSubmitting ? 'Enviando pedido...' : 'Pedir por WhatsApp';
  }

  function setLocationStatus(message) {
    elements.locationStatus.textContent = message;
  }

  function updateAddressVisibility() {
    elements.addressField.classList.toggle('is-hidden', !isDeliverySelected());
  }

  function getDayLabel(dayOfWeek) {
    return DAY_NAMES[dayOfWeek] || '';
  }

  function formatScheduleTimeValue(value) {
    return String(value).slice(0, 5);
  }

  function formatScheduleRange(schedule) {
    return formatScheduleTimeValue(schedule.start_time) + ' - ' + formatScheduleTimeValue(schedule.end_time);
  }

  function getFilteredSchedules() {
    const selectedType = getSelectedDeliveryType();

    return state.fulfillmentSchedules.filter(function filterSchedule(schedule) {
      return schedule.fulfillment_type === 'both' || schedule.fulfillment_type === selectedType;
    });
  }

  function hasSchedulesForSelectedFulfillment() {
    return getFilteredSchedules().length > 0;
  }

  function renderScheduleFields() {
    const filteredSchedules = getFilteredSchedules();
    const groupedSchedules = new Map();

    filteredSchedules.forEach(function groupSchedule(schedule) {
      const dayLabel = getDayLabel(schedule.day_of_week);
      const existing = groupedSchedules.get(dayLabel) || [];
      existing.push(schedule);
      groupedSchedules.set(dayLabel, existing);
    });

    if (filteredSchedules.length === 0) {
      elements.scheduleFields.classList.add('is-hidden');
      elements.fulfillmentDay.innerHTML = '';
      elements.fulfillmentTimeRange.innerHTML = '';
      return;
    }

    elements.scheduleFields.classList.remove('is-hidden');
    elements.fulfillmentDay.innerHTML = Array.from(groupedSchedules.keys()).map(function toOption(dayLabel) {
      const visibleDay = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
      return '<option value="' + escapeHtml(dayLabel) + '">' + escapeHtml(visibleDay) + '</option>';
    }).join('');

    renderScheduleTimeOptions();
  }

  function renderScheduleTimeOptions() {
    const selectedDay = elements.fulfillmentDay.value;
    const schedules = getFilteredSchedules().filter(function filterByDay(schedule) {
      return getDayLabel(schedule.day_of_week) === selectedDay;
    });

    elements.fulfillmentTimeRange.innerHTML = schedules.map(function toOption(schedule) {
      const range = formatScheduleRange(schedule);
      return '<option value="' + escapeHtml(range) + '">' + escapeHtml(range) + '</option>';
    }).join('');
  }

  function setOptionModalOpen(isOpen) {
    elements.optionModal.classList.toggle('is-hidden', !isOpen);
    elements.floatingCartButton.classList.toggle('is-hidden', isOpen || global.CartStore.getSummary(state.settings ? state.settings.delivery_fee : 0, isDeliverySelected()).itemCount === 0);
    document.body.classList.toggle('modal-open', isOpen);
  }

  function getProductOptionGroupCount(product) {
    const parsedCount = Number.parseInt(product.option_group_count, 10);
    return Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : 1;
  }

  function getProductOptionGroupLabel(product) {
    return product.option_group_label && String(product.option_group_label).trim() !== ''
      ? String(product.option_group_label).trim()
      : 'Selección';
  }

  function buildSelectedOptionConfig(product) {
    const selectedOptions = state.selectedOptionIds.map(function mapOption(optionId) {
      return (product.options || []).find(function findOption(option) {
        return option.id === optionId;
      }) || null;
    }).filter(Boolean);
    const selectionDetail = selectedOptions.map(function toDetail(option, index) {
      return {
        slot: index + 1,
        label: getProductOptionGroupLabel(product) + ' ' + (index + 1),
        option_id: option.id,
        option_name: option.name
      };
    });
    const selectionSummary = selectionDetail.length === 0
      ? null
      : selectionDetail.map(function toLine(item) {
          return item.label + ': ' + item.option_name;
        }).join(' · ');

    return {
      option_id: selectedOptions.length === 1 ? selectedOptions[0].id : null,
      option_name: selectedOptions.length === 1 ? selectedOptions[0].name : null,
      selection_summary: selectionSummary,
      selection_detail: selectionDetail,
      selected_option_ids: selectedOptions.map(function toId(option) {
        return option.id;
      }),
      price_modifier_total: selectedOptions.reduce(function sum(accumulator, option) {
        return accumulator + (Number(option.price_modifier) || 0);
      }, 0),
      line_key: selectedOptions.length === 0 ? 'base' : selectedOptions.map(function toId(option) {
        return option.id;
      }).join('-')
    };
  }

  function openOptionModal(product) {
    state.pendingProduct = product;
    state.selectedOptionIds = [];
    elements.optionModalTitle.textContent = product.name;
    elements.optionModalDescription.textContent = product.description || 'Elegi la opcion que corresponde para este producto.';
    elements.optionModalHint.textContent = 'Selecciona cada opción antes de agregar el producto.';
    const optionGroupCount = getProductOptionGroupCount(product);
    const groupLabel = getProductOptionGroupLabel(product);

    elements.optionList.innerHTML = Array.from({ length: optionGroupCount }).map(function renderGroup(_, index) {
      const optionChoices = (product.options || []).map(function toOption(option) {
        const priceModifier = Number(option.price_modifier) || 0;
        const modifierLabel = priceModifier === 0 ? 'Sin cambio de precio' : (priceModifier > 0 ? '+' : '') + formatMoney(priceModifier);

        return [
          '<option value="' + option.id + '">',
          escapeHtml(option.name + (priceModifier === 0 ? '' : ' (' + modifierLabel + ')')),
          '</option>'
        ].join('');
      }).join('');

      return [
        '<label class="field option-group-field">',
        '  <span>' + escapeHtml(groupLabel + ' ' + (index + 1)) + '</span>',
        '  <select data-option-group-index="' + index + '">',
        '    <option value="">Elegí una opción</option>',
             optionChoices,
        '  </select>',
        '</label>'
      ].join('');
    }).join('');
    setOptionModalOpen(true);
  }

  function closeOptionModal() {
    state.pendingProduct = null;
    state.selectedOptionIds = [];
    setOptionModalOpen(false);
  }

  function renderHero() {
    const settings = state.settings;

    if (!settings) {
      return;
    }

    document.title = settings.store_name || 'Q-Commerce Template';
    elements.storeName.textContent = settings.store_name || 'Tienda';
    elements.storeDescription.textContent = settings.store_description || 'Catalogo disponible para hacer tu pedido.';
    elements.storeLocation.textContent = [settings.zone, settings.city].filter(Boolean).join(' · ') || 'Ubicacion no disponible';
    elements.deliverySummary.textContent = buildDeliverySummary(settings);
    elements.brandInitials.textContent = getStoreInitials(settings.store_name);

    if (settings.logo_url) {
      elements.brandLogo.src = settings.logo_url;
      elements.brandLogo.hidden = false;
      elements.brandInitials.hidden = true;
    } else {
      elements.brandLogo.hidden = true;
      elements.brandInitials.hidden = false;
    }

    if (settings.primary_color) {
      document.documentElement.style.setProperty('--primary', settings.primary_color);
    }

    if (settings.secondary_color) {
      document.documentElement.style.setProperty('--secondary', settings.secondary_color);
    }

    if (settings.banner_url) {
      elements.hero.style.setProperty('--hero-image', "linear-gradient(180deg, rgba(10, 10, 10, 0.25), rgba(10, 10, 10, 0.7)), url('" + settings.banner_url + "')");
    }
  }

  function buildDeliverySummary(settings) {
    const pieces = [];

    if (settings.delivery_enabled) {
      pieces.push('Delivery ' + formatMoney(settings.delivery_fee));
    }

    if (settings.pickup_enabled) {
      pieces.push('Retiro en local');
    }

    return pieces.length === 0 ? 'Consultar modalidades disponibles' : pieces.join(' · ');
  }

  function renderCategoryFilters() {
    const activeCategoryId = String(state.activeCategoryId);
    const buttons = [{ id: 'all', name: 'Todo' }].concat(
      state.categories.filter(function onlyActive(category) {
        return category.is_active !== false && String(category.name || '').trim().toLowerCase() !== 'promo';
      }).map(function toFilter(category) {
        return { id: String(category.id), name: category.name };
      })
    );

    elements.categoryFilters.innerHTML = buttons.map(function toButton(category) {
      const activeClass = category.id === activeCategoryId ? ' is-active' : '';
      return '<button class="filter-chip' + activeClass + '" type="button" data-category-filter="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + '</button>';
    }).join('');
  }

  function getFilteredProducts() {
    return state.products.filter(function filterProduct(product) {
      const matchesCategory = state.activeCategoryId === 'all' || String(product.category_id) === String(state.activeCategoryId);
      return matchesCategory && product.is_active !== false;
    });
  }

  function renderProducts() {
    const filteredProducts = getFilteredProducts();
    elements.productCount.textContent = filteredProducts.length + ' producto' + (filteredProducts.length === 1 ? '' : 's');

    if (filteredProducts.length === 0) {
      elements.catalogStatus.classList.remove('is-hidden');
      elements.catalogStatus.textContent = 'No hay productos disponibles para esta categoria.';
      elements.productGrid.innerHTML = '';
      return;
    }

    elements.catalogStatus.classList.add('is-hidden');
    elements.productGrid.innerHTML = filteredProducts.map(function toCard(product) {
      const stockLabel = product.stock === null ? 'Stock a confirmar' : 'Stock: ' + product.stock;
      const imageMarkup = product.image_url
        ? '<img src="' + escapeHtml(product.image_url) + '" alt="' + escapeHtml(product.name) + '" loading="lazy" />'
        : '<div class="product-card__image-placeholder"></div>';

      return [
        '<article class="product-card">',
        '  <div class="product-card__image">' + imageMarkup + '</div>',
        '  <div>',
        '    <div class="product-card__title-row">',
        '      <div>',
        '        <h3 class="product-card__title">' + escapeHtml(product.name) + '</h3>',
        '      </div>',
        '      <span class="price-pill">' + escapeHtml(formatMoney(product.price)) + '</span>',
        '    </div>',
        '    <p class="product-card__description">' + escapeHtml(product.description || 'Producto disponible para pedir.') + '</p>',
        '  </div>',
        '  <div class="product-card__footer">',
        '    <span class="stock-pill">' + escapeHtml(stockLabel) + '</span>',
        '    <button class="primary-button" type="button" data-add-product="' + product.id + '">Agregar</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function renderCart() {
    const summary = global.CartStore.getSummary(state.settings ? state.settings.delivery_fee : 0, isDeliverySelected());

    elements.floatingCartCount.textContent = String(summary.itemCount);
    elements.floatingCartButton.classList.toggle('is-hidden', state.cartOpen || summary.itemCount === 0 || !elements.optionModal.classList.contains('is-hidden'));
    elements.subtotalAmount.textContent = formatMoney(summary.subtotal);
    elements.deliveryAmount.textContent = formatMoney(summary.delivery);
    elements.totalAmount.textContent = formatMoney(summary.total);
    elements.checkoutButton.disabled = state.isSubmittingOrder;
    elements.emptyCartMessage.classList.toggle('is-hidden', summary.itemCount > 0);

    if (summary.itemCount === 0) {
      elements.cartItems.innerHTML = '';
      return;
    }

    elements.cartItems.innerHTML = summary.items.map(function toCartItem(item) {
      const detailLines = Array.isArray(item.selection_detail) && item.selection_detail.length > 0
        ? '<div class="cart-line__detail-list">' + item.selection_detail.map(function toLine(detail) {
            return '<span>' + escapeHtml(detail.label + ': ' + detail.option_name) + '</span>';
          }).join('') + '</div>'
        : '';
      const metaText = [item.category_name || 'Sin categoria', item.selection_summary || item.option_name].filter(Boolean).join(' · ');

      return [
        '<article class="cart-line">',
        '  <div class="cart-line__top">',
        '    <div>',
        '      <h3 class="cart-line__title">' + escapeHtml(item.name) + '</h3>',
        '      <p class="cart-line__meta">' + escapeHtml(metaText) + '</p>',
               detailLines,
        '    </div>',
        '    <button class="remove-button" type="button" aria-label="Eliminar producto" data-remove-product="' + escapeHtml(item.line_id) + '">×</button>',
        '  </div>',
        '  <div class="cart-line__bottom">',
        '    <div class="qty-controls">',
        '      <button class="qty-button" type="button" data-decrease-product="' + escapeHtml(item.line_id) + '">-</button>',
        '      <strong>' + item.quantity + '</strong>',
        '      <button class="qty-button" type="button" data-increase-product="' + escapeHtml(item.line_id) + '">+</button>',
        '    </div>',
        '    <strong>' + escapeHtml(formatMoney(item.price * item.quantity)) + '</strong>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function syncDeliveryOptions() {
    const deliveryInput = document.querySelector('input[name="deliveryType"][value="delivery"]');
    const pickupInput = document.querySelector('input[name="deliveryType"][value="pickup"]');
    const settings = state.settings;

    if (!settings) {
      return;
    }

    deliveryInput.disabled = !settings.delivery_enabled;
    pickupInput.disabled = !settings.pickup_enabled;

    if (settings.delivery_enabled) {
      deliveryInput.checked = true;
    } else if (settings.pickup_enabled) {
      pickupInput.checked = true;
    }

    updateAddressVisibility();
    renderScheduleFields();
  }

  function buildWhatsappMessage(formData) {
    const summary = global.CartStore.getSummary(state.settings.delivery_fee, formData.deliveryType === 'delivery');
    const lines = [
      'Hola ' + (state.settings.store_name || 'tienda') + ', quiero hacer un pedido:',
      '',
      '*Pedido:* #' + formData.orderId,
      '*Cliente:* ' + formData.name,
      '*Telefono:* ' + formData.phone,
      '*Entrega:* ' + (formData.deliveryType === 'delivery' ? 'Delivery' : 'Retiro')
    ];

    if (formData.deliveryType === 'delivery') {
      lines.push('*Direccion:* ' + formData.address);
    }

    lines.push('');
    lines.push('*Productos:*');

    summary.items.forEach(function appendItem(item) {
      lines.push('- ' + item.quantity + ' x ' + item.name + ' (' + formatMoney(item.price * item.quantity) + ')');

      if (Array.isArray(item.selection_detail) && item.selection_detail.length > 0) {
        item.selection_detail.forEach(function appendDetail(detail) {
          lines.push('  · ' + detail.label + ': ' + detail.option_name);
        });
      } else if (item.selection_summary) {
        lines.push('  · ' + item.selection_summary);
      }
    });

    if (formData.fulfillmentDay && formData.fulfillmentTimeRange) {
      lines.push('*Dia:* ' + formData.fulfillmentDay);
      lines.push('*Horario:* ' + formData.fulfillmentTimeRange);
    }

    if (formData.mapsUrl) {
      lines.push('*Ubicación:* ' + formData.mapsUrl);
    }

    lines.push('');
    lines.push('*Subtotal:* ' + formatMoney(formData.subtotal));
    lines.push('*Delivery:* ' + formatMoney(formData.deliveryFee));
    lines.push('*Total:* ' + formatMoney(formData.total));

    if (formData.notes) {
      lines.push('*Observaciones:* ' + formData.notes);
    }

    return lines.join('\n');
  }

  async function handleCheckout(event) {
    event.preventDefault();

    const summary = global.CartStore.getSummary(state.settings.delivery_fee, isDeliverySelected());

    if (summary.itemCount === 0) {
      elements.checkoutHint.textContent = 'Tu carrito esta vacio.';
      showToast('warning', 'Agregá al menos un producto para enviar el pedido.');
      return;
    }

    const formData = {
      name: elements.customerName.value.trim(),
      phone: elements.customerPhone.value.trim(),
      deliveryType: getSelectedDeliveryType(),
      address: elements.customerAddress.value.trim(),
      mapsUrl: elements.customerMapsUrl.value.trim(),
      notes: elements.customerNotes.value.trim(),
      fulfillmentDay: elements.fulfillmentDay.value,
      fulfillmentTimeRange: elements.fulfillmentTimeRange.value
    };

    if (!formData.name) {
      elements.checkoutHint.textContent = 'Ingresa tu nombre para continuar.';
      showToast('warning', 'Completá tu nombre.');
      return;
    }

    if (!formData.phone) {
      elements.checkoutHint.textContent = 'Ingresa un telefono de contacto.';
      showToast('warning', 'Completá tu teléfono.');
      return;
    }

    if (formData.deliveryType === 'delivery' && !formData.address) {
      elements.checkoutHint.textContent = 'Ingresa la direccion para delivery.';
      showToast('warning', 'Ingresá la dirección para delivery.');
      return;
    }

    if (hasSchedulesForSelectedFulfillment() && (!formData.fulfillmentDay || !formData.fulfillmentTimeRange)) {
      elements.checkoutHint.textContent = 'Selecciona dia y horario para continuar.';
      showToast('warning', 'Seleccioná día y horario de entrega.');
      return;
    }

    const whatsappNumber = normalizeWhatsappNumber(state.settings.whatsapp_number);

    if (!whatsappNumber) {
      elements.checkoutHint.textContent = 'No hay un numero de WhatsApp configurado para esta tienda.';
      showToast('error', 'La tienda no tiene WhatsApp configurado.');
      return;
    }

    try {
      setCheckoutSubmitting(true);
      elements.checkoutHint.textContent = 'Guardando pedido...';

      const createdOrder = await global.ClientApi.createOrder({
        customer_name: formData.name,
        customer_phone: formData.phone,
        delivery_type: formData.deliveryType,
        address: formData.deliveryType === 'delivery' ? formData.address : null,
        customer_latitude: state.customerLocation.latitude,
        customer_longitude: state.customerLocation.longitude,
        maps_url: formData.mapsUrl || (state.customerLocation.latitude != null && state.customerLocation.longitude != null
          ? 'https://www.google.com/maps?q=' + state.customerLocation.latitude + ',' + state.customerLocation.longitude
          : null),
        notes: formData.notes,
        fulfillment_day: formData.fulfillmentDay || null,
        fulfillment_time_range: formData.fulfillmentTimeRange || null,
        items: summary.items.map(function toPayloadItem(item) {
          return {
            product_id: item.id,
            product_option_id: item.option_id,
            selected_option_ids: Array.isArray(item.selected_option_ids) ? item.selected_option_ids : undefined,
            quantity: item.quantity
          };
        })
      });

      const message = buildWhatsappMessage({
        ...formData,
        orderId: createdOrder.order.id,
        subtotal: createdOrder.order.subtotal,
        deliveryFee: createdOrder.order.delivery_fee,
        total: createdOrder.order.total
      });
      const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);

      elements.checkoutHint.textContent = 'Pedido guardado. Abriendo WhatsApp...';
      showToast('success', 'Pedido enviado correctamente.');
      global.CartStore.clear();
      global.location.href = whatsappUrl;
    } catch (error) {
      console.error('Error creating order from storefront:', error);
      elements.checkoutHint.textContent = error.message || 'No se pudo guardar el pedido.';
      showToast('error', error.message || 'No se pudo guardar el pedido.');
    } finally {
      setCheckoutSubmitting(false);
    }
  }

  function requestCurrentLocation() {
    if (!global.navigator || !global.navigator.geolocation) {
      showToast('warning', 'Tu navegador no permite obtener la ubicación.');
      setLocationStatus('Tu navegador no permite obtener la ubicación.');
      return;
    }

    setButtonLoading(elements.detectLocationButton, true, 'Ubicando...', 'Usar mi ubicación');
    setLocationStatus('Buscando tu ubicación actual...');

    global.navigator.geolocation.getCurrentPosition(function onSuccess(position) {
      state.customerLocation.latitude = Number(position.coords.latitude.toFixed(6));
      state.customerLocation.longitude = Number(position.coords.longitude.toFixed(6));
      elements.customerMapsUrl.value = 'https://www.google.com/maps?q=' + state.customerLocation.latitude + ',' + state.customerLocation.longitude;
      setLocationStatus('Ubicación capturada correctamente.');
      showToast('success', 'Ubicación confirmada.');
      setButtonLoading(elements.detectLocationButton, false, 'Ubicando...', 'Usar mi ubicación');
    }, function onError() {
      setLocationStatus('No pudimos obtener tu ubicación. Podés pegar un link de Google Maps.');
      showToast('warning', 'No pudimos obtener tu ubicación.');
      setButtonLoading(elements.detectLocationButton, false, 'Ubicando...', 'Usar mi ubicación');
    }, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  }

  function attachEvents() {
    elements.categoryFilters.addEventListener('click', function onFilterClick(event) {
      const button = event.target.closest('[data-category-filter]');

      if (!button) {
        return;
      }

      state.activeCategoryId = button.getAttribute('data-category-filter');
      renderCategoryFilters();
      renderProducts();
    });

    elements.productGrid.addEventListener('click', function onProductAction(event) {
      const addButton = event.target.closest('[data-add-product]');

      if (!addButton) {
        return;
      }

      const productId = Number.parseInt(addButton.getAttribute('data-add-product'), 10);
      const product = state.products.find(function findProduct(currentProduct) {
        return currentProduct.id === productId;
      });

      if (!product) {
        return;
      }

      if (Array.isArray(product.options) && product.options.length > 0) {
        openOptionModal(product);
        return;
      }

      global.CartStore.add(product, null);
      showToast('success', 'Producto agregado al carrito.');

      if (global.innerWidth < 720) {
        setCartOpen(true);
      }
    });

    elements.cartItems.addEventListener('click', function onCartAction(event) {
      const increaseButton = event.target.closest('[data-increase-product]');
      const decreaseButton = event.target.closest('[data-decrease-product]');
      const removeButton = event.target.closest('[data-remove-product]');

      if (increaseButton) {
        global.CartStore.increase(increaseButton.getAttribute('data-increase-product'));
      }

      if (decreaseButton) {
        global.CartStore.decrease(decreaseButton.getAttribute('data-decrease-product'));
      }

      if (removeButton) {
        global.CartStore.remove(removeButton.getAttribute('data-remove-product'));
        showToast('info', 'Producto eliminado del carrito.');
      }
    });

    elements.checkoutForm.addEventListener('submit', handleCheckout);
    elements.checkoutForm.addEventListener('change', function onFormChange(event) {
      if (event.target.name === 'deliveryType') {
        updateAddressVisibility();
        renderScheduleFields();
        renderCart();
      }
    });

    elements.fulfillmentDay.addEventListener('change', renderScheduleTimeOptions);
    elements.detectLocationButton.addEventListener('click', requestCurrentLocation);

    elements.floatingCartButton.addEventListener('click', function openCart() {
      setCartOpen(true);
    });

    elements.closeCartButton.addEventListener('click', function closeCart() {
      setCartOpen(false);
    });

    elements.optionList.addEventListener('change', function onOptionSelect(event) {
      const optionSelect = event.target.closest('[data-option-group-index]');

      if (optionSelect) {
        const index = Number.parseInt(optionSelect.getAttribute('data-option-group-index'), 10);
        state.selectedOptionIds[index] = optionSelect.value === '' ? null : Number.parseInt(optionSelect.value, 10);
      }
    });

    elements.confirmOptionButton.addEventListener('click', function confirmOption() {
      if (!state.pendingProduct) {
        return;
      }

      const requiredSelections = getProductOptionGroupCount(state.pendingProduct);
      const cleanedSelectionIds = state.selectedOptionIds.filter(function onlyOptionId(optionId) {
        return Number.isInteger(optionId) && optionId > 0;
      });

      if (cleanedSelectionIds.length !== requiredSelections) {
        elements.optionModalHint.textContent = 'Selecciona una opcion para continuar.';
        showToast('warning', 'Elegí una opción para el producto.');
        return;
      }

      global.CartStore.add(state.pendingProduct, buildSelectedOptionConfig(state.pendingProduct));
      showToast('success', 'Producto agregado al carrito.');
      closeOptionModal();

      if (global.innerWidth < 720) {
        setCartOpen(true);
      }
    });

    elements.closeOptionModalButton.addEventListener('click', closeOptionModal);
    elements.optionModalBackdrop.addEventListener('click', closeOptionModal);

    global.CartStore.subscribe(function onCartUpdate() {
      renderCart();
    });
  }

  async function loadData() {
    try {
      const data = await Promise.all([
        global.ClientApi.getSettings(),
        global.ClientApi.getCategories(),
        global.ClientApi.getProducts(),
        global.ClientApi.getFulfillmentSchedules()
      ]);

      state.settings = data[0];
      state.categories = data[1];
      state.products = data[2];
      state.fulfillmentSchedules = data[3];

      renderHero();
      renderCategoryFilters();
      renderProducts();
      syncDeliveryOptions();
      renderScheduleFields();
      renderCart();
      elements.catalogStatus.classList.add('is-hidden');
    } catch (error) {
      console.error('Error loading storefront:', error);
      elements.catalogStatus.classList.remove('is-hidden');
      elements.catalogStatus.textContent = 'No se pudo cargar el catalogo. Revisa que el backend este corriendo y que API_BASE_URL apunte al host correcto.';
      showToast('error', 'No se pudo cargar el catalogo.');
    }
  }

  function init() {
    attachEvents();
    updateAddressVisibility();
    setCheckoutSubmitting(false);
    renderCart();
    runLeicoTyping();
    setLocationStatus('Podés escribir la dirección, usar geolocalización o pegar un link de Maps.');
    loadData();
  }

  init();
})(window);
