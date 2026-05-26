(function attachCartStore(global) {
  const STORAGE_KEY = 'qcommerce-client-cart';

  function parsePrice(value) {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  function readInitialState() {
    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);

      if (!storedValue) {
        return [];
      }

      const parsed = JSON.parse(storedValue);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error reading cart storage:', error);
      return [];
    }
  }

  function createCartStore() {
    let items = readInitialState();
    const listeners = new Set();

    function persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart storage:', error);
      }
    }

    function notify() {
      persist();
      listeners.forEach(function runListener(listener) {
        listener(getItems());
      });
    }

    function getItems() {
      return items.map(function cloneItem(item) {
        return { ...item };
      });
    }

    function subscribe(listener) {
      listeners.add(listener);

      return function unsubscribe() {
        listeners.delete(listener);
      };
    }

    function normalizeSelectedConfig(selectedConfig) {
      if (!selectedConfig) {
        return {
          option_id: null,
          option_name: null,
          selection_summary: null,
          selection_detail: [],
          selected_option_ids: [],
          price_modifier_total: 0,
          line_key: 'base'
        };
      }

      if (selectedConfig.selection_detail || selectedConfig.selected_option_ids) {
        return {
          option_id: selectedConfig.option_id ?? null,
          option_name: selectedConfig.option_name ?? null,
          selection_summary: selectedConfig.selection_summary ?? selectedConfig.option_name ?? null,
          selection_detail: Array.isArray(selectedConfig.selection_detail) ? selectedConfig.selection_detail : [],
          selected_option_ids: Array.isArray(selectedConfig.selected_option_ids) ? selectedConfig.selected_option_ids : (selectedConfig.option_id ? [selectedConfig.option_id] : []),
          price_modifier_total: parsePrice(selectedConfig.price_modifier_total),
          line_key: selectedConfig.line_key || ((selectedConfig.selected_option_ids || []).join('-') || (selectedConfig.option_id == null ? 'base' : String(selectedConfig.option_id)))
        };
      }

      return {
        option_id: selectedConfig.id ?? null,
        option_name: selectedConfig.name ?? null,
        selection_summary: selectedConfig.name ?? null,
        selection_detail: selectedConfig.id == null ? [] : [{
          slot: 1,
          label: 'Selección 1',
          option_id: selectedConfig.id,
          option_name: selectedConfig.name
        }],
        selected_option_ids: selectedConfig.id == null ? [] : [selectedConfig.id],
        price_modifier_total: parsePrice(selectedConfig.price_modifier),
        line_key: selectedConfig.id == null ? 'base' : String(selectedConfig.id)
      };
    }

    function buildLineId(productId, selectionKey) {
      return String(productId) + ':' + selectionKey;
    }

    function add(product, selectedOption) {
      const normalizedConfig = normalizeSelectedConfig(selectedOption);
      const lineId = buildLineId(product.id, normalizedConfig.line_key);
      const existingItem = items.find(function findItem(item) {
        return item.line_id === lineId;
      });

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        items = items.concat({
          line_id: lineId,
          id: product.id,
          name: product.name,
          option_id: normalizedConfig.option_id,
          option_name: normalizedConfig.option_name,
          selection_summary: normalizedConfig.selection_summary,
          selection_detail: normalizedConfig.selection_detail,
          selected_option_ids: normalizedConfig.selected_option_ids,
          price: parsePrice(product.price) + normalizedConfig.price_modifier_total,
          image_url: product.image_url || null,
          category_name: product.category_name || null,
          quantity: 1
        });
      }

      notify();
    }

    function increase(lineId) {
      items = items.map(function increaseItem(item) {
        if (item.line_id !== lineId) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1
        };
      });

      notify();
    }

    function decrease(lineId) {
      items = items
        .map(function decreaseItem(item) {
          if (item.line_id !== lineId) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1
          };
        })
        .filter(function keepPositive(item) {
          return item.quantity > 0;
        });

      notify();
    }

    function remove(lineId) {
      items = items.filter(function filterItem(item) {
        return item.line_id !== lineId;
      });

      notify();
    }

    function clear() {
      items = [];
      notify();
    }

    function getSummary(deliveryFee, isDeliverySelected) {
      const subtotal = items.reduce(function sum(currentTotal, item) {
        return currentTotal + item.price * item.quantity;
      }, 0);

      const normalizedDeliveryFee = parsePrice(deliveryFee);
      const delivery = isDeliverySelected ? normalizedDeliveryFee : 0;

      return {
        subtotal,
        delivery,
        total: subtotal + delivery,
        items: getItems(),
        itemCount: items.reduce(function count(total, item) {
          return total + item.quantity;
        }, 0)
      };
    }

    return {
      subscribe,
      getItems,
      add,
      increase,
      decrease,
      remove,
      clear,
      getSummary
    };
  }

  global.CartStore = createCartStore();
})(window);
