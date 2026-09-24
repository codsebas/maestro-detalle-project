require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const db = require('./db');
const registroController = require('./controllers/registroController');
const misionesController = require('./controllers/misionesController');
const estudiantesController = require('./controllers/estudiantesController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Maestro-Detalle operando correctamente' });
});

// Rutas API del Laboratorio
app.post('/api/registro', registroController.registrarEstudianteMisiones);
app.get('/api/misiones', misionesController.obtenerMisiones);
app.get('/api/estudiantes', estudiantesController.obtenerEstudiantes);

// Redireccionar raíz a la interfaz del Tablero (o /api-docs si no hay SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar BD y Servidor Express
async function startServer() {
  await db.initDb();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`📚 Documentación Swagger UI en: http://localhost:${PORT}/api-docs`);
    console.log(`💻 Tablero Frontend en: http://localhost:${PORT}/`);
  });
}

startServer();

module.exports = app;
