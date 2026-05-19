(function attachUiLabels(global) {
  const ORDER_STATUS = {
    pending: 'Nuevo',
    new: 'Nuevo',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const FULFILLMENT_TYPE = {
    delivery: 'Delivery',
    pickup: 'Retiro',
    both: 'Ambos'
  };

  global.UiLabels = {
    orderStatus(value) {
      return ORDER_STATUS[value] || value || '-';
    },
    fulfillmentType(value) {
      return FULFILLMENT_TYPE[value] || value || '-';
    },
    booleanStatus(value) {
      return value ? 'Activo' : 'Inactivo';
    }
  };
})(window);
