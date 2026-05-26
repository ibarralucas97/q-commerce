const closureAdminService = require('../../services/admin/closure.admin.service');

async function getClosures(req, res) {
  try {
    const closures = await closureAdminService.getClosures();
    return res.json(closures);
  } catch (error) {
    console.error('Error fetching closures:', error);
    return res.status(500).json({ error: 'internal server error' });
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
    console.error('Error fetching closure detail:', error);
    return res.status(500).json({ error: 'internal server error' });
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
    console.error('Error closing active batch:', error);
    return res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = {
  getClosures,
  getClosureById,
  closeActiveBatch
};
