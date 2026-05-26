const closureAdminService = require('../../services/admin/closure.admin.service');

async function getClosures(req, res) {
  try {
    const closures = await closureAdminService.getClosures();
    return res.json(closures);
  } catch (error) {
    console.error('[GET /api/admin/closures] Error fetching closures:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      error: 'ADMIN_CLOSURES_FETCH_FAILED',
      message: 'No se pudo cargar la caja del panel.',
      details: error.message
    });
  }
}

async function getClosureById(req, res) {
  try {
    const closureId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(closureId)) {
      return res.status(404).json({ error: 'closure not found' });
    }

    const closure = await closureAdminService.getClosureById(closureId);

    if (!closure) {
      return res.status(404).json({ error: 'closure not found' });
    }

    return res.json(closure);
  } catch (error) {
    console.error('[GET /api/admin/closures/:id] Error fetching closure detail:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      error: 'ADMIN_CLOSURE_FETCH_FAILED',
      message: 'No se pudo cargar el detalle del cierre.',
      details: error.message
    });
  }
}

async function closeActiveBatch(req, res) {
  try {
    const notes = req.body && typeof req.body.notes === 'string' && req.body.notes.trim() !== ''
      ? req.body.notes.trim()
      : null;
    const result = await closureAdminService.closeActiveBatch(notes);

    if (result.error) {
      return res.status(result.statusCode).json({ error: result.error });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('[POST /api/admin/closures/close] Error closing active batch:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      error: 'ADMIN_CLOSURE_CREATE_FAILED',
      message: 'No se pudo cerrar la caja activa.',
      details: error.message
    });
  }
}

module.exports = {
  getClosures,
  getClosureById,
  closeActiveBatch
};
