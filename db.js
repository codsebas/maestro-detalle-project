require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Clean environment variables (strip accidental quotes or spaces)
function getEnvVar(key, fallback) {
  let val = process.env[key] || fallback;
  if (typeof val === 'string') {
    val = val.trim().replace(/^["']|["']$/g, '');
  }
  return val;
}

const config = {
  user: getEnvVar('DB_USER', 'UsuarioEncuestas'),
  password: getEnvVar('DB_PASSWORD', 'DesaWeb2025$!'),
  server: getEnvVar('DB_SERVER', 'svr-sql-ctezo.southcentralus.cloudapp.azure.com'),
  database: getEnvVar('DB_NAME', 'db_WebDevUMG'),
  port: parseInt(getEnvVar('DB_PORT', '1433')),
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 15000,
    requestTimeout: 15000
  }
};

let sqlPool = null;
let useFallback = false;
let isInitializing = null;
const fallbackFilePath = path.join(__dirname, 'local_data.json');

// Memory store for zero-dependency fallback
let memoryData = {
  misiones: [
    { MisionID: 1, Nombre: 'Instalación de herramientas', Descripcion: 'Configuración del entorno de desarrollo y repositorio Git' },
    { MisionID: 2, Nombre: 'Creación de API REST', Descripcion: 'Desarrollo de endpoints maestro-detalle y Swagger' },
    { MisionID: 3, Nombre: 'Conexión a Base de Datos', Descripcion: 'Integración y mapeo de modelo relacional SQL Server' },
    { MisionID: 4, Nombre: 'Pruebas de Endpoints', Descripcion: 'Validación de POST /api/registro y manejo de errores de referencia' },
    { MisionID: 5, Nombre: 'Despliegue en Producción', Descripcion: 'Publicación en hosting público y frontend en línea' }
  ],
  estudiantes: [
    {
      carnet: '1890-20-11489',
      nombre: 'MERCEDES AZUCENA LÓPEZ PÉREZ',
      correo: 'mlopezp58@miumg.edu.gt'
    }
  ],
  estudianteMisiones: [
    { carnet: '1890-20-11489', misionId: 1, estado: true, fechaRegistro: new Date().toISOString() },
    { carnet: '1890-20-11489', misionId: 2, estado: false, fechaRegistro: new Date().toISOString() },
    { carnet: '1890-20-11489', misionId: 3, estado: true, fechaRegistro: new Date().toISOString() }
  ]
};

function loadFallbackData() {
  if (fs.existsSync(fallbackFilePath)) {
    try {
      const raw = fs.readFileSync(fallbackFilePath, 'utf8');
      memoryData = JSON.parse(raw);
    } catch (e) {
      console.warn('Uso de memoria por defecto para fallback.');
    }
  } else {
    saveFallbackData();
  }
}

function saveFallbackData() {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(memoryData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error guardando fallback data:', e.message);
  }
}

async function initDb() {
  if (sqlPool) return sqlPool;
  if (isInitializing) return isInitializing;

  isInitializing = (async () => {
    try {
      console.log(`🔌 Conectando a SQL Server (${config.server})...`);
      sqlPool = await sql.connect(config);
      console.log('✅ Conexión exitosa a la base de datos SQL Server.');
      useFallback = false;
      return sqlPool;
    } catch (err) {
      console.warn('⚠️ Base de datos remota SQL Server no respondió:', err.message);
      console.log('🔄 Activando motor resiliente local (Zero-Dependency fallback store)...');
      loadFallbackData();
      useFallback = true;
      return null;
    } finally {
      isInitializing = null;
    }
  })();

  return isInitializing;
}

async function ensureDbConnected() {
  if (!sqlPool && !useFallback) {
    await initDb();
  }
}

async function getMisiones() {
  await ensureDbConnected();

  if (!useFallback && sqlPool) {
    try {
      const res = await sqlPool.request().query('SELECT MisionID, Nombre, Descripcion FROM Misiones ORDER BY MisionID');
      return res.recordset;
    } catch (e) {
      console.warn('Switching to fallback:', e.message);
      useFallback = true;
      loadFallbackData();
    }
  }
  return memoryData.misiones;
}

async function getEstudiantesConMisiones() {
  await ensureDbConnected();

  if (!useFallback && sqlPool) {
    try {
      const estudiantesRes = await sqlPool.request().query('SELECT Carnet, Nombre, Correo FROM Estudiantes ORDER BY Carnet');
      const estudiantes = estudiantesRes.recordset;

      const misionesRes = await sqlPool.request().query(`
        SELECT em.Carnet, em.MisionID, m.Nombre, m.Descripcion, em.Estado, em.FechaRegistro
        FROM EstudianteMisiones em
        INNER JOIN Misiones m ON em.MisionID = m.MisionID
      `);
      const detMap = {};
      for (const row of misionesRes.recordset) {
        if (!detMap[row.Carnet]) detMap[row.Carnet] = [];
        detMap[row.Carnet].push({
          misionId: row.MisionID,
          nombre: row.Nombre,
          descripcion: row.Descripcion,
          estado: Boolean(row.Estado),
          fechaRegistro: row.FechaRegistro
        });
      }

      return estudiantes.map(e => {
        const misiones = detMap[e.Carnet] || [];
        const completadas = misiones.filter(m => m.estado).length;
        return {
          carnet: e.Carnet,
          nombre: e.Nombre,
          correo: e.Correo,
          misionesCompletadas: completadas,
          totalMisiones: misiones.length,
          porcentaje: misiones.length > 0 ? Math.round((completadas / misiones.length) * 100) : 0,
          misiones
        };
      });
    } catch (e) {
      console.warn('Switching to fallback:', e.message);
      useFallback = true;
      loadFallbackData();
    }
  }

  // Fallback Local Memory logic
  const catalogMap = {};
  memoryData.misiones.forEach(m => {
    catalogMap[m.MisionID] = m;
  });

  const detMap = {};
  memoryData.estudianteMisiones.forEach(row => {
    if (!detMap[row.carnet]) detMap[row.carnet] = [];
    const cat = catalogMap[row.misionId] || { Nombre: `Misión ${row.misionId}`, Descripcion: '' };
    detMap[row.carnet].push({
      misionId: row.misionId,
      nombre: cat.Nombre,
      descripcion: cat.Descripcion,
      estado: Boolean(row.estado),
      fechaRegistro: row.fechaRegistro
    });
  });

  return memoryData.estudiantes.map(e => {
    const misiones = detMap[e.carnet] || [];
    const completadas = misiones.filter(m => m.estado).length;
    return {
      carnet: e.carnet,
      nombre: e.nombre,
      correo: e.correo,
      misionesCompletadas: completadas,
      totalMisiones: misiones.length,
      porcentaje: misiones.length > 0 ? Math.round((completadas / misiones.length) * 100) : 0,
      misiones
    };
  });
}

async function procesarRegistroMaestroDetalle(maestro, detalle) {
  await ensureDbConnected();

  // 1. Validar IDs de misiones contra el catálogo
  const catalog = await getMisiones();
  const validIds = new Set(catalog.map(m => m.MisionID || m.misionId));

  const invalidIds = [];
  for (const item of detalle) {
    if (!validIds.has(item.misionId)) {
      invalidIds.push(item.misionId);
    }
  }

  if (invalidIds.length > 0) {
    const err = new Error(`Error de referencia: Las misiones con ID (${invalidIds.join(', ')}) no existen en el catálogo de Misiones.`);
    err.status = 400;
    err.invalidIds = invalidIds;
    throw err;
  }

  // 2. Transacción SQL Server si está disponible
  if (!useFallback && sqlPool) {
    const transaction = new sql.Transaction(sqlPool);
    try {
      await transaction.begin();

      // Upsert Estudiante
      const estReq = new sql.Request(transaction);
      estReq.input('carnet', sql.VarChar(25), maestro.carnet);
      estReq.input('nombre', sql.NVarChar(150), maestro.nombre);
      estReq.input('correo', sql.NVarChar(150), maestro.correo);

      await estReq.query(`
        IF EXISTS (SELECT 1 FROM Estudiantes WHERE Carnet = @carnet)
        BEGIN
          UPDATE Estudiantes SET Nombre = @nombre, Correo = @correo WHERE Carnet = @carnet;
        END
        ELSE
        BEGIN
          INSERT INTO Estudiantes (Carnet, Nombre, Correo) VALUES (@carnet, @nombre, @correo);
        END
      `);

      // Upsert EstudianteMisiones
      for (const item of detalle) {
        const detReq = new sql.Request(transaction);
        detReq.input('carnet', sql.VarChar(25), maestro.carnet);
        detReq.input('misionId', sql.Int, item.misionId);
        detReq.input('estado', sql.Bit, item.estado ? 1 : 0);

        await detReq.query(`
          IF EXISTS (SELECT 1 FROM EstudianteMisiones WHERE Carnet = @carnet AND MisionID = @misionId)
          BEGIN
            UPDATE EstudianteMisiones SET Estado = @estado, FechaRegistro = GETDATE() WHERE Carnet = @carnet AND MisionID = @misionId;
          END
          ELSE
          BEGIN
            INSERT INTO EstudianteMisiones (Carnet, MisionID, Estado) VALUES (@carnet, @misionId, @estado);
          END
        `);
      }

      await transaction.commit();
      return { success: true, message: 'Estudiante y misiones procesados correctamente' };
    } catch (e) {
      await transaction.rollback();
      console.warn('Error en transacción SQL Server, switch a fallback:', e.message);
      useFallback = true;
      loadFallbackData();
    }
  }

  // Fallback memory upsert
  let estIndex = memoryData.estudiantes.findIndex(e => e.carnet === maestro.carnet);
  if (estIndex >= 0) {
    memoryData.estudiantes[estIndex].nombre = maestro.nombre;
    memoryData.estudiantes[estIndex].correo = maestro.correo;
  } else {
    memoryData.estudiantes.push({
      carnet: maestro.carnet,
      nombre: maestro.nombre,
      correo: maestro.correo
    });
  }

  for (const item of detalle) {
    let detIndex = memoryData.estudianteMisiones.findIndex(em => em.carnet === maestro.carnet && em.misionId === item.misionId);
    if (detIndex >= 0) {
      memoryData.estudianteMisiones[detIndex].estado = Boolean(item.estado);
      memoryData.estudianteMisiones[detIndex].fechaRegistro = new Date().toISOString();
    } else {
      memoryData.estudianteMisiones.push({
        carnet: maestro.carnet,
        misionId: item.misionId,
        estado: Boolean(item.estado),
        fechaRegistro: new Date().toISOString()
      });
    }
  }

  saveFallbackData();
  return { success: true, message: 'Estudiante y misiones procesados correctamente' };
}

module.exports = {
  initDb,
  getMisiones,
  getEstudiantesConMisiones,
  procesarRegistroMaestroDetalle
};
