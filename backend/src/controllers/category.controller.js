const categoryService = require('../services/category.service');

async function getCategories(req, res) {
  try {
    const categories = await categoryService.getCategories();

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);

    res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getCategories
};
