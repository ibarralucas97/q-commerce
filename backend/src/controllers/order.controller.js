const orderService = require('../services/order.service');

async function createOrder(req, res) {
  try {
    const result = await orderService.createOrder(req.body);

    if (result.error) {
      return res.status(result.statusCode).json({
        error: result.error
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating order:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  createOrder
};
