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

// Swagger UI Documentation in clean Light Mode
const swaggerOptions = {
  customCss: `
    .swagger-ui { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    .swagger-ui .topbar { background-color: #ffffff; border-bottom: 1px solid #e2e8f0; box-shadow: none; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #0f172a; font-weight: 700; }
    .swagger-ui .scheme-container { background: #ffffff; box-shadow: none; border-bottom: 1px solid #e2e8f0; }
  `,
  customSiteTitle: 'Documentación API Maestro-Detalle | UMG'
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Maestro-Detalle operando correctamente en modo claro' });
});

// Rutas API del Laboratorio
app.post('/api/registro', registroController.registrarEstudianteMisiones);
app.get('/api/misiones', misionesController.obtenerMisiones);
app.get('/api/estudiantes', estudiantesController.obtenerEstudiantes);

// Redireccionar raíz a la interfaz del Tablero
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar BD y Servidor Express
async function startServer() {
  await db.initDb();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`📚 Documentación Swagger UI en modo claro: http://localhost:${PORT}/api-docs`);
    console.log(`💻 Tablero Frontend en modo claro: http://localhost:${PORT}/`);
  });
}

startServer();

module.exports = app;
