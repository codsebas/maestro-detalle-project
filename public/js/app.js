document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const estudiantesGrid = document.getElementById('estudiantesGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const resultCount = document.getElementById('resultCount');

  const statEstudiantes = document.getElementById('statEstudiantes');
  const statMisiones = document.getElementById('statMisiones');
  const statPromedio = document.getElementById('statPromedio');

  const btnRefresh = document.getElementById('btnRefresh');
  const btnViewCatalog = document.getElementById('btnViewCatalog');

  const catalogModal = document.getElementById('catalogModal');
  const catalogList = document.getElementById('catalogList');
  const btnCloseCatalog = document.getElementById('btnCloseCatalog');

  const postModal = document.getElementById('postModal');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const btnSendPost = document.getElementById('btnSendPost');
  const jsonPayload = document.getElementById('jsonPayload');

  const btnLoadValidJson = document.getElementById('btnLoadValidJson');
  const btnLoadInvalidJson = document.getElementById('btnLoadInvalidJson');

  const responseBox = document.getElementById('responseBox');
  const responseStatus = document.getElementById('responseStatus');
  const responseTime = document.getElementById('responseTime');
  const responseContent = document.getElementById('responseContent');

  let stateEstudiantes = [];
  let stateMisiones = [];

  const validExampleJson = {
    "maestro": {
      "carnet": "1890-20-11489",
      "nombre": "MERCEDES AZUCENA LÓPEZ PÉREZ",
      "correo": "mlopezp58@miumg.edu.gt"
    },
    "detalle": [
      { "misionId": 1, "estado": true },
      { "misionId": 2, "estado": false },
      { "misionId": 3, "estado": true }
    ]
  };

  const invalidExampleJson = {
    "maestro": {
      "carnet": "1890-20-99999",
      "nombre": "ESTUDIANTE CON PRUEBA DE ERROR",
      "correo": "prueba_error@miumg.edu.gt"
    },
    "detalle": [
      { "misionId": 1, "estado": true },
      { "misionId": 99, "estado": true }
    ]
  };

  // Initial Load
  jsonPayload.value = JSON.stringify(validExampleJson, null, 2);
  loadData();

  // Event Listeners
  btnRefresh.addEventListener('click', loadData);
  searchInput.addEventListener('input', renderEstudiantes);

  btnViewCatalog.addEventListener('click', openCatalog);
  btnCloseCatalog.addEventListener('click', () => catalogModal.classList.add('hidden'));

  btnOpenModal.addEventListener('click', () => {
    responseBox.classList.add('hidden');
    postModal.classList.remove('hidden');
  });

  btnCloseModal.addEventListener('click', () => postModal.classList.add('hidden'));
  btnCancelModal.addEventListener('click', () => postModal.classList.add('hidden'));

  btnLoadValidJson.addEventListener('click', () => {
    jsonPayload.value = JSON.stringify(validExampleJson, null, 2);
  });

  btnLoadInvalidJson.addEventListener('click', () => {
    jsonPayload.value = JSON.stringify(invalidExampleJson, null, 2);
  });

  btnSendPost.addEventListener('click', sendPostRegistro);

  // Fetch Data from API
  async function loadData() {
    try {
      const [resEst, resMis] = await Promise.all([
        fetch('/api/estudiantes'),
        fetch('/api/misiones')
      ]);

      const dataEst = await resEst.json();
      const dataMis = await resMis.json();

      if (dataEst.status === 'success') {
        stateEstudiantes = dataEst.data || [];
      }
      if (dataMis.status === 'success') {
        stateMisiones = dataMis.data || [];
      }

      updateMetrics();
      renderEstudiantes();
    } catch (err) {
      console.error('Error cargando datos de la API:', err);
    }
  }

  function updateMetrics() {
    statEstudiantes.textContent = stateEstudiantes.length;
    statMisiones.textContent = stateMisiones.length;

    if (stateEstudiantes.length > 0) {
      const sum = stateEstudiantes.reduce((acc, curr) => acc + (curr.porcentaje || 0), 0);
      const avg = Math.round(sum / stateEstudiantes.length);
      statPromedio.textContent = `${avg}%`;
    } else {
      statPromedio.textContent = '0%';
    }
  }

  function renderEstudiantes() {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = stateEstudiantes.filter(e =>
      e.carnet.toLowerCase().includes(query) ||
      e.nombre.toLowerCase().includes(query) ||
      e.correo.toLowerCase().includes(query)
    );

    resultCount.textContent = `${filtered.length} registro${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      estudiantesGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    estudiantesGrid.innerHTML = filtered.map(est => {
      const porcentaje = est.porcentaje || 0;
      let badgeColor = 'bg-slate-700 text-slate-300';
      if (porcentaje === 100) badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      else if (porcentaje > 0) badgeColor = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';

      const misionesHtml = (est.misiones || []).map(m => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-xs">
          <div class="flex items-center gap-2.5">
            <span class="${m.estado ? 'text-emerald-400' : 'text-slate-500'} font-bold">#${m.misionId}</span>
            <div>
              <p class="font-medium text-slate-200">${m.nombre}</p>
              <p class="text-[11px] text-slate-400">${m.descripcion || ''}</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
            m.estado ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }">
            <i class="fa-solid ${m.estado ? 'fa-check' : 'fa-clock'} mr-1"></i>
            ${m.estado ? 'Completada' : 'Pendiente'}
          </span>
        </div>
      `).join('');

      return `
        <div class="student-card bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5">
          <div>
            <div class="flex items-start justify-between gap-3">
              <div>
                <span class="inline-block bg-blue-500/10 text-blue-400 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-500/20 mb-2">
                  <i class="fa-solid fa-id-card mr-1"></i> ${est.carnet}
                </span>
                <h3 class="text-base font-bold text-white leading-snug">${est.nombre}</h3>
                <p class="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <i class="fa-solid fa-envelope text-slate-500"></i> ${est.correo}
                </p>
              </div>

              <span class="px-3 py-1.5 rounded-xl text-xs font-bold ${badgeColor}">
                ${porcentaje}% Avance
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4 space-y-1.5">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Misiones: <strong>${est.misionesCompletadas}</strong> de ${est.misiones.length}</span>
                <span>${porcentaje}%</span>
              </div>
              <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div class="progress-fill h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" style="width: ${porcentaje}%"></div>
              </div>
            </div>
          </div>

          <!-- Misiones Detail List -->
          <div class="space-y-2 border-t border-slate-700/60 pt-4">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detalle de Misiones</h4>
            ${misionesHtml || '<p class="text-xs text-slate-500 italic">No hay misiones registradas.</p>'}
          </div>
        </div>
      `;
    }).join('');
  }

  function openCatalog() {
    catalogList.innerHTML = stateMisiones.map(m => `
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="bg-blue-600/20 text-blue-400 font-bold px-3 py-1.5 rounded-lg border border-blue-500/30 font-mono text-sm">
            ID: ${m.MisionID || m.misionId}
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">${m.Nombre || m.nombre}</h4>
            <p class="text-xs text-slate-400 mt-0.5">${m.Descripcion || m.descripcion || 'Sin descripción'}</p>
          </div>
        </div>
      </div>
    `).join('');

    catalogModal.classList.remove('hidden');
  }

  async function sendPostRegistro() {
    let payload;
    try {
      payload = JSON.parse(jsonPayload.value);
    } catch (e) {
      alert('Error: El texto en el editor no es un JSON válido.');
      return;
    }

    const startTime = Date.now();
    btnSendPost.disabled = true;
    btnSendPost.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando...`;

    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const elapsed = Date.now() - startTime;
      const jsonRes = await response.json();

      responseBox.classList.remove('hidden');
      responseTime.textContent = `${elapsed} ms`;

      if (response.ok) {
        responseBox.className = 'rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs font-mono text-emerald-300';
        responseStatus.textContent = `HTTP ${response.status} OK`;
        responseContent.textContent = JSON.stringify(jsonRes, null, 2);

        // Actualizar datos automáticamente tras registro exitoso
        loadData();
      } else {
        responseBox.className = 'rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs font-mono text-rose-300';
        responseStatus.textContent = `HTTP ${response.status} Bad Request`;
        responseContent.textContent = JSON.stringify(jsonRes, null, 2);
      }
    } catch (err) {
      responseBox.classList.remove('hidden');
      responseBox.className = 'rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs font-mono text-rose-300';
      responseStatus.textContent = `ERROR DE RED`;
      responseContent.textContent = err.message;
    } finally {
      btnSendPost.disabled = false;
      btnSendPost.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar POST /api/registro`;
    }
  }
});
