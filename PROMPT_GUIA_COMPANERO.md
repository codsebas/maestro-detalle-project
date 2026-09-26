# 🚀 Guía y Prompt Maestro: API Maestro-Detalle con Catálogo y Control de Estado
> **Uso:** Copia y pega el prompt de la Sección 2 en un nuevo chat de Antigravity para que genere automáticamente un proyecto **completamente único en diseño y experiencia de usuario**, manteniendo el 100% de la lógica de negocio requerida por la UMG.

---

## 📋 1. Resumen de Diferenciación Visual y UI

Para asegurar que el proyecto de tu compañero se distinga por completo del tuyo frente al catedrático, esta guía establece una identidad visual e interfaz totalmente opuesta:

| Elemento | Tu Proyecto | Proyecto del Compañero (Generado con este Prompt) |
| :--- | :--- | :--- |
| **Tema / Modo** | Light Mode (Claro Off-White `#f4f4f0`) | **Dark Ocean / Cyberpunk Professional Mode** (`#0f172a`) |
| **Paleta de Colores** | Verde Musgo / Sage (`#b7c396`) | **Cian Neón (`#06b6d4`), Índigo (`#6366f1`) y Violeta (`#8b5cf6`)** |
| **Tipografía** | System UI / Sans Estándar | **Google Font: *Plus Jakarta Sans*** |
| **Flujo de Registro** | Formulario de 2 columnas con botones de 3 vías | **Formulario por Pasos (Wizard Stepper 1-2-3)** |
| **Controles de Misión** | Selector de 3 botones (`No enviar` / `Pendiente` / `Completada`) | **Switches Deslizantes Neón (Toggle Switches ON/OFF)** |
| **Visualización Tablero** | Grid de Cards tradicionales | **Tabla de Datos Interactiva (Data Table) + Anillos de Progreso SVG** |
| **Documentación** | Swagger UI Estándar | **Swagger UI con Tema Dark Cyberpunk Personalizado** |

---

## 🤖 2. Prompt Maestro para Antigravity (Copia desde aquí)

```markdown
<USER_REQUEST>
Hola Antigravity. Necesito que actúes como desarrollador Full-Stack Senior de sistemas web y construyas un proyecto completo para una asignación universitaria de la UMG. 

El proyecto consiste en una **API Maestro-Detalle con Catálogo y Control de Estado** en el backend y un **Tablero Web interactivo** en el frontend.

### 📌 REQUISITOS DE LÓGICA DE NEGOCIO (OBLIGATORIOS)
El sistema debe procesar el registro maestro-detalle en un solo POST al endpoint `/api/registro`.

El JSON que recibe la API debe tener la siguiente estructura exacta:
{
  "maestro": {
    "carnet": "1890-20-11489",
    "nombre": "NOMBRE DEL ESTUDIANTE",
    "correo": "correo@miumg.edu.gt"
  },
  "detalle": [
    { "misionId": 1, "estado": true },
    { "misionId": 2, "estado": false }
  ]
}

Reglas de negocio del backend:
1. Si el carnet no existe en la BD -> Insertar estudiante en la tabla `Estudiantes`.
2. Si el carnet ya existe -> Actualizar sus datos (nombre y correo).
3. Procesar detalle: Validar que cada `misionId` exista en la tabla `Misiones`.
4. Si un `misionId` NO existe -> Devolver error de referencia (`400 Bad Request`) con mensaje explicativo.
5. Si existe y no está en `EstudianteMisiones` -> Insertar registro.
6. Si ya existe en `EstudianteMisiones` -> Actualizar el campo `estado` (`true`/`false`).
7. Debe permitir múltiples peticiones POST manteniendo la consistencia de los datos.

Endpoints obligatorios:
- `POST /api/registro`: Procesa el JSON Maestro-Detalle.
- `GET /api/misiones`: Retorna el catálogo de misiones disponibles.
- `GET /api/estudiantes`: Retorna el listado de estudiantes con el desglose de misiones y porcentaje de avance.
- `GET /api-docs`: Documentación interactiva Swagger UI / OpenAPI 3.0.

Credenciales de la Base de Datos SQL Server:
- Server: `svr-sql-ctezo.southcentralus.cloudapp.azure.com`
- Database: `db_WebDevUMG`
- User: `UsuarioEncuestas`
- Password: `DesaWeb2025$!`
- Port: `1433`

---

### 🎨 REQUISITOS DE DISEÑO Y EXPERIENCIA DE USUARIO (DIFERENCIADOS)

Quiero un diseño moderno, limpio y distinguido que utilice un tema **Dark Ocean Cyberpunk**:
1. **Paleta de Colores**:
   - Fondo de página: Azul Marino Oscuro / Slate (`#0f172a` y `#1e293b`).
   - Superficies de tarjetas y modales: `#1e293b` con bordes finos cian/azul (`#334155`).
   - Colores de Acento: Cian Neón (`#06b6d4`), Índigo (`#6366f1`) y Esmeralda (`#10b981`).
   - Tipografía principal: Google Font **'Plus Jakarta Sans'**.

2. **Interfaz del Frontend (SPA en HTML5 + TailwindCSS + JS Vanilla)**:
   - **Tablero Principal**: Muestra una **Tabla de Datos Interactiva (Data Table)** con búsqueda inteligente, badges brillantes y **Anillos de Progreso SVG (Circular Progress Rings)** para el avance porcentual.
   - **Flujo de Registro (Wizard por Pasos / Stepper 1-2-3)**:
     - *Paso 1 (Datos Maestro):* Inputs con validación visual para Carnet, Nombre y Correo.
     - *Paso 2 (Detalle de Misiones):* Listado de misiones presentadas como tarjetas con **Switches Deslizantes Neón (Toggle Switches ON/OFF)** para marcar estado Completada o Pendiente.
     - *Paso 3 (Confirmación y Envío):* Vista de resumen y botón de envío POST a la API.
   - **Probador HTTP / Consola de Pruebas API**:
     - Pestaña dedicada tipo Postman/cURL para enviar peticiones personalizadas y ver respuestas HTTP en formato JSON coloreado.

3. **Arquitectura y Estructura del Backend (Node.js + Express)**:
   - Implementa un adaptador de BD en `db.js` con **Lazy Connection** e incluye un **Mecanismo de Resiliencia / Fallback Store** sin dependencias nativas en C++ (`local_data.json`) para que si SQL Server o el firewall tienen problemas, la aplicación siga funcionando 100% online y en Vercel.
   - Documentación Swagger UI en `/api-docs` con tema oscuro personalizado matching el estilo de la web.
   - Archivo `vercel.json` configurado para despliegue serverless inmediato en Vercel.

Por favor genera todos los archivos del proyecto (`server.js`, `db.js`, `swagger.json`, `package.json`, `public/index.html`, `public/css/styles.css`, `public/js/app.js`, `README.md`, `.env.example`, `vercel.json`) y explícame cómo ejecutarlo y desplegarlo.
</USER_REQUEST>
```

---

## 🛠️ 3. Pasos para que tu Compañero ejecute el Prompt en su Antigravity

1. **Crear una carpeta limpia para su proyecto**:
   ```bash
   mkdir maestro-detalle-estudiante
   cd maestro-detalle-estudiante
   ```
2. **Abrir Antigravity en esa carpeta**.
3. **Copiar y pegar el texto entre las etiquetas `<USER_REQUEST>` de la Sección 2** en la ventana de chat de Antigravity.
4. Antigravity creará automáticamente toda la estructura Node.js, Express, la interfaz visual por pasos (Wizard), la base de datos resiliente y la documentación en Swagger.

---

## 🌐 4. Instrucciones de Despliegue Público (Vercel + GitHub)

Una vez que Antigravity termine de generar el proyecto de tu compañero:

1. **Inicializar Git y Vincular al Repositorio de tu compañero**:
   ```bash
   git init
   git remote add origin https://github.com/TU_COMPANERO/maestro-detalle-frontend.git
   git add .
   git commit -m "feat: initial commit of master-detail API and Cyberpunk dashboard"
   git push -u origin main
   ```

2. **Desplegar en Vercel**:
   - Ir a [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New Project**.
   - Seleccionar el repositorio de tu compañero.
   - En **Environment Variables**, agregar:
     - `DB_USER`: `UsuarioEncuestas`
     - `DB_PASSWORD`: `DesaWeb2025$!`
     - `DB_SERVER`: `svr-sql-ctezo.southcentralus.cloudapp.azure.com`
     - `DB_NAME`: `db_WebDevUMG`
     - `DB_PORT`: `1433`
     - `PORT`: `3000`
   - Hacer clic en **Deploy**.
