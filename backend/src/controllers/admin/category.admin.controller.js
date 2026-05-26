const categoryAdminService = require('../../services/admin/category.admin.service');
const auditLogService = require('../../services/audit-log.service');

function normalizeCategoryPayload(body) {
  return {
    name: body.name,
    description: body.description ?? null,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : true
  };
}

function getAuditActor(req) {
  return {
    actorUserId: req.adminUser && req.adminUser.sub ? Number(req.adminUser.sub) : null,
    actorName: req.adminUser && req.adminUser.username ? req.adminUser.username : 'admin'
  };
}

async function getCategories(req, res) {
  try {
    const categories = await categoryAdminService.getCategories();

    return res.json(categories);
  } catch (error) {
    console.error('Error fetching admin categories:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function getCategoryById(req, res) {
  try {
    const categoryId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(categoryId)) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    const category = await categoryAdminService.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    return res.json(category);
  } catch (error) {
    console.error('Error fetching admin category:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function createCategory(req, res) {
  try {
    const payload = normalizeCategoryPayload(req.body);

    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      return res.status(400).json({
        error: 'name is required'
      });
    }

    const category = await categoryAdminService.createCategory({
      ...payload,
      name: payload.name.trim()
    });

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'CATEGORY_CREATED',
      entityType: 'category',
      entityId: category.id,
      entityLabel: category.name,
      beforeData: null,
      afterData: category,
      metadata: null
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Error creating admin category:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = Number.parseInt(req.params.id, 10);
    const payload = normalizeCategoryPayload(req.body);

    if (Number.isNaN(categoryId)) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    if (typeof payload.name !== 'string' || payload.name.trim() === '') {
      return res.status(400).json({
        error: 'name is required'
      });
    }

    const existingCategory = await categoryAdminService.getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    const category = await categoryAdminService.updateCategory(categoryId, {
      ...payload,
      name: payload.name.trim()
    });

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'CATEGORY_UPDATED',
      entityType: 'category',
      entityId: category.id,
      entityLabel: category.name,
      beforeData: existingCategory,
      afterData: category,
      metadata: null
    });

    return res.json(category);
  } catch (error) {
    console.error('Error updating admin category:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function deactivateCategory(req, res) {
  try {
    const categoryId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(categoryId)) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    const existingCategory = await categoryAdminService.getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    const category = await categoryAdminService.softDeleteCategory(categoryId);

    if (!category) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'CATEGORY_DISABLED',
      entityType: 'category',
      entityId: category.id,
      entityLabel: category.name,
      beforeData: existingCategory,
      afterData: category,
      metadata: null
    });

    return res.json(category);
  } catch (error) {
    console.error('Error deactivating admin category:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(categoryId)) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    const existingCategory = await categoryAdminService.getCategoryById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    const productsCount = await categoryAdminService.getAssociatedProductsCount(categoryId);

    if (productsCount > 0) {
      return res.status(400).json({
        error: 'CATEGORY_DELETE_BLOCKED',
        message: 'No se puede eliminar la categoría porque tiene productos asociados.'
      });
    }

    const category = await categoryAdminService.hardDeleteCategory(categoryId);

    if (!category) {
      return res.status(404).json({
        error: 'category not found'
      });
    }

    await auditLogService.log({
      ...getAuditActor(req),
      action: 'CATEGORY_DELETED',
      entityType: 'category',
      entityId: existingCategory.id,
      entityLabel: existingCategory.name,
      beforeData: existingCategory,
      afterData: null,
      metadata: {
        deleted: true
      }
    });

    return res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin category:', error);

    return res.status(500).json({
      error: 'internal server error'
    });
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deactivateCategory,
  deleteCategory
};
