(function bootstrapClientApp(global) {
  const state = {
    settings: null,
    categories: [],
    products: [],
    activeCategoryId: 'all',
    cartOpen: false,
    isSubmittingOrder: false
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
    customerNotes: document.getElementById('customerNotes'),
    addressField: document.getElementById('addressField'),
    checkoutHint: document.getElementById('checkoutHint'),
    checkoutButton: document.getElementById('checkoutButton'),
    floatingCartButton: document.getElementById('floatingCartButton'),
    floatingCartCount: document.getElementById('floatingCartCount'),
    closeCartButton: document.getElementById('closeCartButton')
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
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

    if (!selectedOption) {
      return 'pickup';
    }

    return selectedOption.value;
  }

  function isDeliverySelected() {
    return getSelectedDeliveryType() === 'delivery';
  }

  function normalizeWhatsappNumber(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function setCartOpen(isOpen) {
    state.cartOpen = isOpen;
    elements.cartPanel.classList.toggle('is-open', isOpen);
  }

  function setCheckoutSubmitting(isSubmitting) {
    state.isSubmittingOrder = isSubmitting;
    elements.checkoutButton.disabled = isSubmitting || global.CartStore.getSummary(state.settings ? state.settings.delivery_fee : 0, isDeliverySelected()).itemCount === 0;
    elements.checkoutButton.textContent = isSubmitting ? 'Enviando pedido...' : 'Pedir por WhatsApp';
  }

  function updateAddressVisibility() {
    elements.addressField.classList.toggle('is-hidden', !isDeliverySelected());
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

    if (pieces.length === 0) {
      return 'Consultar modalidades disponibles';
    }

    return pieces.join(' · ');
  }

  function renderCategoryFilters() {
    const activeCategoryId = String(state.activeCategoryId);
    const buttons = [{ id: 'all', name: 'Todo' }].concat(
      state.categories
        .filter(function onlyActive(category) {
          return category.is_active !== false;
        })
        .map(function toFilter(category) {
          return {
            id: String(category.id),
            name: category.name
          };
        })
    );

    elements.categoryFilters.innerHTML = buttons
      .map(function toButton(category) {
        const activeClass = category.id === activeCategoryId ? ' is-active' : '';

        return '<button class="filter-chip' + activeClass + '" type="button" data-category-filter="' + escapeHtml(category.id) + '">' + escapeHtml(category.name) + '</button>';
      })
      .join('');
  }

  function getFilteredProducts() {
    return state.products.filter(function filterProduct(product) {
      const matchesCategory = state.activeCategoryId === 'all' || String(product.category_id) === String(state.activeCategoryId);
      const isActive = product.is_active !== false;

      return matchesCategory && isActive;
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
    elements.productGrid.innerHTML = filteredProducts
      .map(function toCard(product) {
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
          '        <span class="product-card__category">' + escapeHtml(product.category_name || 'Sin categoria') + '</span>',
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
      })
      .join('');
  }

  function renderCart() {
    const summary = global.CartStore.getSummary(state.settings ? state.settings.delivery_fee : 0, isDeliverySelected());

    elements.floatingCartCount.textContent = String(summary.itemCount);
    elements.subtotalAmount.textContent = formatMoney(summary.subtotal);
    elements.deliveryAmount.textContent = formatMoney(summary.delivery);
    elements.totalAmount.textContent = formatMoney(summary.total);
    elements.checkoutButton.disabled = summary.itemCount === 0;
    elements.emptyCartMessage.classList.toggle('is-hidden', summary.itemCount > 0);

    if (summary.itemCount === 0) {
      elements.cartItems.innerHTML = '';
      return;
    }

    elements.cartItems.innerHTML = summary.items
      .map(function toCartItem(item) {
        return [
          '<article class="cart-line">',
          '  <div class="cart-line__top">',
          '    <div>',
          '      <h3 class="cart-line__title">' + escapeHtml(item.name) + '</h3>',
          '      <p class="cart-line__meta">' + escapeHtml(item.category_name || 'Sin categoria') + '</p>',
          '    </div>',
          '    <button class="remove-button" type="button" aria-label="Eliminar producto" data-remove-product="' + item.id + '">×</button>',
          '  </div>',
          '  <div class="cart-line__bottom">',
          '    <div class="qty-controls">',
          '      <button class="qty-button" type="button" data-decrease-product="' + item.id + '">-</button>',
          '      <strong>' + item.quantity + '</strong>',
          '      <button class="qty-button" type="button" data-increase-product="' + item.id + '">+</button>',
          '    </div>',
          '    <strong>' + escapeHtml(formatMoney(item.price * item.quantity)) + '</strong>',
          '  </div>',
          '</article>'
        ].join('');
      })
      .join('');
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
    });

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
      return;
    }

    const formData = {
      name: elements.customerName.value.trim(),
      phone: elements.customerPhone.value.trim(),
      deliveryType: getSelectedDeliveryType(),
      address: elements.customerAddress.value.trim(),
      notes: elements.customerNotes.value.trim()
    };

    if (!formData.name) {
      elements.checkoutHint.textContent = 'Ingresá tu nombre para continuar.';
      return;
    }

    if (!formData.phone) {
      elements.checkoutHint.textContent = 'Ingresá un telefono de contacto.';
      return;
    }

    if (formData.deliveryType === 'delivery' && !formData.address) {
      elements.checkoutHint.textContent = 'Ingresá la direccion para delivery.';
      return;
    }

    const whatsappNumber = normalizeWhatsappNumber(state.settings.whatsapp_number);

    if (!whatsappNumber) {
      elements.checkoutHint.textContent = 'No hay un numero de WhatsApp configurado para esta tienda.';
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
        notes: formData.notes,
        items: summary.items.map(function toPayloadItem(item) {
          return {
            product_id: item.id,
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
      global.CartStore.clear();
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error('Error creating order from storefront:', error);
      elements.checkoutHint.textContent = error.message || 'No se pudo guardar el pedido.';
    } finally {
      setCheckoutSubmitting(false);
    }
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

      global.CartStore.add(product);

      if (window.innerWidth < 720) {
        setCartOpen(true);
      }
    });

    elements.cartItems.addEventListener('click', function onCartAction(event) {
      const increaseButton = event.target.closest('[data-increase-product]');
      const decreaseButton = event.target.closest('[data-decrease-product]');
      const removeButton = event.target.closest('[data-remove-product]');

      if (increaseButton) {
        global.CartStore.increase(Number.parseInt(increaseButton.getAttribute('data-increase-product'), 10));
      }

      if (decreaseButton) {
        global.CartStore.decrease(Number.parseInt(decreaseButton.getAttribute('data-decrease-product'), 10));
      }

      if (removeButton) {
        global.CartStore.remove(Number.parseInt(removeButton.getAttribute('data-remove-product'), 10));
      }
    });

    elements.checkoutForm.addEventListener('submit', handleCheckout);
    elements.checkoutForm.addEventListener('change', function onFormChange(event) {
      if (event.target.name === 'deliveryType') {
        updateAddressVisibility();
        renderCart();
      }
    });

    elements.floatingCartButton.addEventListener('click', function openCart() {
      setCartOpen(true);
    });

    elements.closeCartButton.addEventListener('click', function closeCart() {
      setCartOpen(false);
    });

    global.CartStore.subscribe(function onCartUpdate() {
      renderCart();
    });
  }

  async function loadData() {
    try {
      const data = await Promise.all([
        global.ClientApi.getSettings(),
        global.ClientApi.getCategories(),
        global.ClientApi.getProducts()
      ]);

      state.settings = data[0];
      state.categories = data[1];
      state.products = data[2];

      renderHero();
      renderCategoryFilters();
      renderProducts();
      syncDeliveryOptions();
      renderCart();
      elements.catalogStatus.classList.add('is-hidden');
    } catch (error) {
      console.error('Error loading storefront:', error);
      elements.catalogStatus.classList.remove('is-hidden');
      elements.catalogStatus.textContent = 'No se pudo cargar el catalogo. Revisá que el backend esté corriendo y que API_BASE_URL apunte al host correcto.';
    }
  }

  function init() {
    attachEvents();
    updateAddressVisibility();
    setCheckoutSubmitting(false);
    renderCart();
    loadData();
  }

  init();
})(window);
