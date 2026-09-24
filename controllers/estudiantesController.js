const db = require('../db');

async function obtenerEstudiantes(req, res) {
  try {
    const estudiantes = await db.getEstudiantesConMisiones();
    return res.status(200).json({
      status: 'success',
      total: estudiantes.length,
      data: estudiantes
    });
  } catch (err) {
    console.error('Error al obtener estudiantes:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Error al consultar el listado de estudiantes y sus misiones.'
    });
  }
}

module.exports = {
  obtenerEstudiantes
};
