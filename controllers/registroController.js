const db = require('../db');

async function registrarEstudianteMisiones(req, res) {
  try {
    const { maestro, detalle } = req.body || {};

    // Validaciones básicas del cuerpo del JSON
    if (!maestro || typeof maestro !== 'object') {
      return res.status(400).json({
        status: 'error',
        error: 'Formato inválido',
        message: 'El JSON debe contener un objeto "maestro" con carnet, nombre y correo.'
      });
    }

    const { carnet, nombre, correo } = maestro;
    if (!carnet || !nombre || !correo) {
      return res.status(400).json({
        status: 'error',
        error: 'Campos requeridos faltantes',
        message: 'El objeto "maestro" debe incluir carnet, nombre y correo.'
      });
    }

    if (!Array.isArray(detalle) || detalle.length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'Formato inválido',
        message: 'El campo "detalle" debe ser una lista no vacía de misiones.'
      });
    }

    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];
      if (item.misionId === undefined || item.misionId === null || typeof item.estado !== 'boolean') {
        return res.status(400).json({
          status: 'error',
          error: 'Formato de detalle inválido',
          message: `El elemento en la posición ${i} del detalle debe contener 'misionId' (número) y 'estado' (booleano true/false).`
        });
      }
    }

    // Procesar la transacción maestro-detalle
    const result = await db.procesarRegistroMaestroDetalle(maestro, detalle);

    return res.status(200).json({
      status: 'success',
      message: result.message,
      data: {
        carnet,
        nombre,
        correo,
        misionesProcesadas: detalle.length
      }
    });

  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({
        status: 'error',
        error: 'Error de referencia',
        message: err.message,
        invalidMisionIds: err.invalidIds || []
      });
    }

    console.error('Error procesando /api/registro:', err);
    return res.status(500).json({
      status: 'error',
      error: 'Error interno del servidor',
      message: 'Ocurrió un error inesperado al procesar la solicitud.'
    });
  }
}

module.exports = {
  registrarEstudianteMisiones
};
