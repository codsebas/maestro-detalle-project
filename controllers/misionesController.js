const db = require('../db');

async function obtenerMisiones(req, res) {
  try {
    const misiones = await db.getMisiones();
    return res.status(200).json({
      status: 'success',
      total: misiones.length,
      data: misiones
    });
  } catch (err) {
    console.error('Error al obtener misiones:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Error al consultar el catálogo de misiones.'
    });
  }
}

module.exports = {
  obtenerMisiones
};
