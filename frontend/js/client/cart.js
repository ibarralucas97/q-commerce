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

    function add(product) {
      const existingItem = items.find(function findItem(item) {
        return item.id === product.id;
      });

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        items = items.concat({
          id: product.id,
          name: product.name,
          price: parsePrice(product.price),
          image_url: product.image_url || null,
          category_name: product.category_name || null,
          quantity: 1
        });
      }

      notify();
    }

    function increase(productId) {
      items = items.map(function increaseItem(item) {
        if (item.id !== productId) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1
        };
      });

      notify();
    }

    function decrease(productId) {
      items = items
        .map(function decreaseItem(item) {
          if (item.id !== productId) {
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

    function remove(productId) {
      items = items.filter(function filterItem(item) {
        return item.id !== productId;
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
