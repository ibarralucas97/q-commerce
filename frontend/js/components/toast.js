(function attachToastSystem(global) {
  const TOAST_ROOT_ID = 'toastRoot';
  const DEFAULT_DURATION = 3200;
  let root = null;

  function ensureRoot() {
    if (root && document.body.contains(root)) {
      return root;
    }

    root = document.getElementById(TOAST_ROOT_ID);

    if (!root) {
      root = document.createElement('div');
      root.id = TOAST_ROOT_ID;
      root.className = 'toast-root';
      root.setAttribute('aria-live', 'polite');
      root.setAttribute('aria-atomic', 'false');
      document.body.appendChild(root);
    }

    return root;
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) {
      return;
    }

    toast.classList.remove('is-visible');
    toast.classList.add('is-leaving');

    global.setTimeout(function removeAfterAnimation() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 220);
  }

  function show(options) {
    const settings = options || {};
    const type = settings.type || 'info';
    const message = String(settings.message || '').trim();
    const duration = Number.isFinite(settings.duration) ? settings.duration : DEFAULT_DURATION;
    const dismissible = settings.dismissible !== false;

    if (!message) {
      return null;
    }

    const toastRoot = ensureRoot();
    const toast = document.createElement('article');
    const body = document.createElement('div');
    const text = document.createElement('p');

    toast.className = 'toast toast--' + type;
    body.className = 'toast__body';
    text.className = 'toast__message';
    text.textContent = message;

    body.appendChild(text);
    toast.appendChild(body);

    if (dismissible) {
      const closeButton = document.createElement('button');

      closeButton.type = 'button';
      closeButton.className = 'toast__close';
      closeButton.setAttribute('aria-label', 'Cerrar notificacion');
      closeButton.textContent = '×';
      closeButton.addEventListener('click', function onClose() {
        removeToast(toast);
      });
      toast.appendChild(closeButton);
    }

    toastRoot.appendChild(toast);

    global.requestAnimationFrame(function revealToast() {
      toast.classList.add('is-visible');
    });

    if (duration > 0) {
      global.setTimeout(function hideToast() {
        removeToast(toast);
      }, duration);
    }

    return toast;
  }

  global.Toast = {
    show: show,
    success(message, duration) {
      return show({ type: 'success', message: message, duration: duration });
    },
    error(message, duration) {
      return show({ type: 'error', message: message, duration: duration });
    },
    warning(message, duration) {
      return show({ type: 'warning', message: message, duration: duration });
    },
    info(message, duration) {
      return show({ type: 'info', message: message, duration: duration });
    }
  };
})(window);
