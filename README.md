# 🚀 API Maestro-Detalle con Catálogo y Control de Estado

> **Universidad Mariano Gálvez de Guatemala (UMG)**  
> **Curso:** Desarrollo Web | Octavo Ciclo  
> **Estudiante:** Mercedes Azucena López Pérez (Carnet: `1890-20-11489`)  
> **Repositorio GitHub:** [codsebas/maestro-detalle-project](https://github.com/codsebas/maestro-detalle-project.git)

---

## 📌 1. Descripción del Proyecto

Solución Full-Stack de **API RESTful** y **Tablero de Avance (Dashboard)** para el manejo y control de misiones académicas en una arquitectura **Maestro-Detalle**.

El sistema procesa en un solo `POST /api/registro` el encabezado del estudiante (Maestro) y la lista de misiones (Detalle), realizando las siguientes acciones:
1. **Insertar estudiante** si no existe por su carnet.
2. **Actualizar datos del estudiante** si ya existe (nombre/correo).
3. **Validar existencia de los IDs de misión** en el catálogo oficial de la BD. Si algún ID no existe, retorna un **Error de Referencia** (`400 Bad Request`).
4. **Insertar o actualizar el estado (`true`/`false`)** de cada misión en el detalle.
5. **Control de Múltiples POST:** Permite envíos repetidos manteniendo la integridad y consistencia de la información.

---

## 🏛️ 2. Modelo Relacional de Base de Datos (ERD)

```mermaid
erDiagram
    Estudiantes ||--o{ EstudianteMisiones : "tiene"
    Misiones ||--o{ EstudianteMisiones : "se asigna en"

    Estudiantes {
        varchar(25) Carnet PK
        nvarchar(150) Nombre
        nvarchar(150) Correo UK
    }

    Misiones {
        int MisionID PK "IDENTITY(1,1)"
        nvarchar(100) Nombre
        nvarchar(250) Descripcion
    }

    EstudianteMisiones {
        int DetalleID PK "IDENTITY(1,1)"
        varchar(25) Carnet FK
        int MisionID FK
        bit Estado
        datetime FechaRegistro
    }
```

### Credenciales de Base de Datos (SQL Server Azure)
- **Servidor:** `svr-sql-ctezo.southcentralus.cloudapp.azure.com`
- **Base de Datos:** `db_WebDevUMG`
- **Usuario:** `UsuarioEncuestas`
- **Contraseña:** `DesaWeb2025$!`

---

## 📡 3. Especificación de Endpoints API

### 1. `POST /api/registro`
Recibe el JSON maestro-detalle y procesa la transacción en la BD.

**Ejemplo de JSON enviado:**
```json
{
  "maestro": {
    "carnet": "1890-20-11489",
    "nombre": "MERCEDES AZUCENA LÓPEZ PÉREZ",
    "correo": "mlopezp58@miumg.edu.gt"
  },
  "detalle": [
    {
      "misionId": 1,
      "estado": true
    },
    {
      "misionId": 2,
      "estado": false
    },
    {
      "misionId": 3,
      "estado": true
    }
  ]
}
```

**Respuesta Exitosa (`200 OK`):**
```json
{
  "status": "success",
  "message": "Estudiante y misiones procesados correctamente",
  "data": {
    "carnet": "1890-20-11489",
    "nombre": "MERCEDES AZUCENA LÓPEZ PÉREZ",
    "correo": "mlopezp58@miumg.edu.gt",
    "misionesProcesadas": 3
  }
}
```

**Respuesta Error de Referencia (`400 Bad Request`):**
```json
{
  "status": "error",
  "error": "Error de referencia",
  "message": "Las misiones con ID (99) no existen en el catálogo de Misiones.",
  "invalidMisionIds": [99]
}
```

---

### 2. `GET /api/misiones`
Consulta el catálogo oficial de misiones disponibles.

**Respuesta Ejemplo:**
```json
{
  "status": "success",
  "total": 5,
  "data": [
    {
      "MisionID": 1,
      "Nombre": "Instalación de herramientas",
      "Descripcion": "Configuración de entorno de desarrollo y repositorio Git"
    }
  ]
}
```

---

### 3. `GET /api/estudiantes`
Consulta el avance de todos los estudiantes y el estado de sus misiones.

---

### 4. `GET /api-docs` (Documentación Swagger UI)
Documentación interactiva OpenAPI 3.0 para probar los endpoints en línea directamente desde el navegador.

---

## 🖥️ 4. Tablero Frontend Dashboard

El proyecto incluye una aplicación web interactiva responsiva con:
- **Resumen de Avance:** Porcentaje de completación ($0\% - 100\%$) e indicadores de avance global.
- **Detalle de Misiones:** Desglose del estado de cada misión por estudiante.
- **Probador de POST Integrado:** Consola interactiva para enviar solicitudes `POST /api/registro` y verificar códigos de estado HTTP y JSON de respuesta.
- **Buscador en tiempo real:** Filtrado por carnet o nombre.

---

## 💻 5. Instrucciones de Ejecución Local

1. **Clonar repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/codsebas/maestro-detalle-project.git
   cd maestro-detalle-project
   npm install
   ```

2. **Ejecutar el servidor local:**
   ```bash
   npm start
   ```

3. **Acceso en el navegador:**
   - **Tablero Frontend:** `http://localhost:3000`
   - **Swagger UI:** `http://localhost:3000/api-docs`
   - **Endpoint Registro:** `http://localhost:3000/api/registro`

---

## 🌐 6. Guía de Despliegue en la Nube

El proyecto está preparado para su despliegue inmediato en hosting público:
- **Vercel / Render:** Despliegue automático desde la rama `main` conectando la URL del repositorio de GitHub.
- **GitHub Pages / Host estático:** Consumiendo la API alojada en la nube.
