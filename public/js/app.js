document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs & Views
  const tabTablero = document.getElementById('tabTablero');
  const tabRegistrar = document.getElementById('tabRegistrar');
  const tabCatalog = document.getElementById('tabCatalog');

  const viewTablero = document.getElementById('viewTablero');
  const viewRegistrar = document.getElementById('viewRegistrar');
  const viewCatalog = document.getElementById('viewCatalog');

  // Tablero Elements
  const estudiantesGrid = document.getElementById('estudiantesGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const resultCount = document.getElementById('resultCount');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnGoToRegister = document.getElementById('btnGoToRegister');

  const statEstudiantes = document.getElementById('statEstudiantes');
  const statMisiones = document.getElementById('statMisiones');
  const statPromedio = document.getElementById('statPromedio');

  // Form & JSON Editor Elements
  const inputCarnet = document.getElementById('inputCarnet');
  const inputNombre = document.getElementById('inputNombre');
  const inputCorreo = document.getElementById('inputCorreo');
  const misionesFormList = document.getElementById('misionesFormList');
  const jsonEditor = document.getElementById('jsonEditor');
  const btnToggleEditMode = document.getElementById('btnToggleEditMode');
  const lblToggleEdit = document.getElementById('lblToggleEdit');
  const jsonModeBadge = document.getElementById('jsonModeBadge');

  const btnSubmitForm = document.getElementById('btnSubmitForm');
  const btnPreloadValid = document.getElementById('btnPreloadValid');
  const btnPreloadInvalid = document.getElementById('btnPreloadInvalid');

  const responseContainer = document.getElementById('responseContainer');
  const resStatusBadge = document.getElementById('resStatusBadge');
  const resTimeBadge = document.getElementById('resTimeBadge');
  const resBodyContent = document.getElementById('resBodyContent');

  // Catalog Grid Element
  const catalogGrid = document.getElementById('catalogGrid');

  // Application State
  let stateEstudiantes = [];
  let stateMisiones = [];
  let missionStates = {}; // { missionId: 'no-enviar' | 'pendiente' | 'completada' }
  let isDirectJsonEditMode = false;

  // Defaults
  const defaultValidStudent = {
    carnet: '1890-20-11489',
    nombre: 'MERCEDES AZUCENA LÓPEZ PÉREZ',
    correo: 'mlopezp58@miumg.edu.gt'
  };

  // Initial Load
  loadData();

  // Navigation Event Listeners
  tabTablero.addEventListener('click', () => switchTab('tablero'));
  tabRegistrar.addEventListener('click', () => switchTab('registrar'));
  tabCatalog.addEventListener('click', () => switchTab('catalog'));
  btnGoToRegister.addEventListener('click', () => switchTab('registrar'));

  function switchTab(tab) {
    // Reset tab button styles
    [tabTablero, tabRegistrar, tabCatalog].forEach(t => {
      t.className = 'px-4 py-2 rounded-lg transition-all text-slate-600 hover:text-slate-900';
    });
    [viewTablero, viewRegistrar, viewCatalog].forEach(v => v.classList.add('hidden'));

    if (tab === 'tablero') {
      tabTablero.className = 'px-4 py-2 rounded-lg transition-all bg-white text-slate-900 shadow-sm font-bold';
      viewTablero.classList.remove('hidden');
    } else if (tab === 'registrar') {
      tabRegistrar.className = 'px-4 py-2 rounded-lg transition-all bg-white text-slate-900 shadow-sm font-bold';
      viewRegistrar.classList.remove('hidden');
    } else if (tab === 'catalog') {
      tabCatalog.className = 'px-4 py-2 rounded-lg transition-all bg-white text-slate-900 shadow-sm font-bold';
      viewCatalog.classList.remove('hidden');
    }
  }

  // Real-time Inputs Event Listeners
  [inputCarnet, inputNombre, inputCorreo].forEach(input => {
    input.addEventListener('input', () => {
      if (!isDirectJsonEditMode) updateGeneratedJson();
    });
  });

  btnRefresh.addEventListener('click', loadData);
  searchInput.addEventListener('input', renderEstudiantes);

  // Direct Edit Mode Toggle
  btnToggleEditMode.addEventListener('click', () => {
    isDirectJsonEditMode = !isDirectJsonEditMode;

    if (isDirectJsonEditMode) {
      jsonEditor.removeAttribute('readonly');
      jsonEditor.classList.add('ring-2', 'ring-[#7d8e56]', 'bg-[#151810]');
      lblToggleEdit.textContent = 'Modificar desde formulario';
      jsonModeBadge.textContent = 'Edición Manual Directa';
      jsonModeBadge.className = 'text-[10px] uppercase font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md';
    } else {
      jsonEditor.setAttribute('readonly', 'true');
      jsonEditor.classList.remove('ring-2', 'ring-[#7d8e56]', 'bg-[#151810]');
      lblToggleEdit.textContent = 'Editar JSON directamente';
      jsonModeBadge.textContent = 'Sincronizado con Formulario';
      jsonModeBadge.className = 'text-[10px] uppercase font-mono font-bold bg-[#e9efe4] text-[#617042] px-2.5 py-1 rounded-md';
      updateGeneratedJson();
    }
  });

  btnPreloadValid.addEventListener('click', () => {
    inputCarnet.value = defaultValidStudent.carnet;
    inputNombre.value = defaultValidStudent.nombre;
    inputCorreo.value = defaultValidStudent.correo;

    // Set first few missions to completed/pending
    stateMisiones.forEach((m, idx) => {
      if (idx === 0) missionStates[m.MisionID || m.misionId] = 'completada';
      else if (idx === 1) missionStates[m.MisionID || m.misionId] = 'pendiente';
      else if (idx === 2) missionStates[m.MisionID || m.misionId] = 'completada';
      else missionStates[m.MisionID || m.misionId] = 'no-enviar';
    });

    renderMisionesFormList();
    if (!isDirectJsonEditMode) updateGeneratedJson();
  });

  btnPreloadInvalid.addEventListener('click', () => {
    isDirectJsonEditMode = true;
    jsonEditor.removeAttribute('readonly');
    lblToggleEdit.textContent = 'Modificar desde formulario';
    jsonModeBadge.textContent = 'Modo Prueba Error Referencia (ID 99)';
    jsonModeBadge.className = 'text-[10px] uppercase font-mono font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md';

    const invalidJson = {
      maestro: {
        carnet: "1890-20-99999",
        nombre: "ESTUDIANTE PRUEBA ERROR",
        correo: "error_referencia@miumg.edu.gt"
      },
      detalle: [
        { misionId: 1, estado: true },
        { misionId: 99, estado: true } // ID 99 doesn't exist in catalog!
      ]
    };
    jsonEditor.value = JSON.stringify(invalidJson, null, 2);
  });

  btnSubmitForm.addEventListener('click', handlePostSubmission);

  // Load API Data
  async function loadData() {
    try {
      const [resEst, resMis] = await Promise.all([
        fetch('/api/estudiantes'),
        fetch('/api/misiones')
      ]);

      const dataEst = await resEst.json();
      const dataMis = await resMis.json();

      if (dataEst.status === 'success') stateEstudiantes = dataEst.data || [];
      if (dataMis.status === 'success') stateMisiones = dataMis.data || [];

      // Initialize mission states default to 'no-enviar'
      stateMisiones.forEach(m => {
        const id = m.MisionID || m.misionId;
        if (!missionStates[id]) missionStates[id] = 'no-enviar';
      });

      // Default first student values for form
      if (!inputCarnet.value && stateEstudiantes.length > 0) {
        inputCarnet.value = stateEstudiantes[0].carnet;
        inputNombre.value = stateEstudiantes[0].nombre;
        inputCorreo.value = stateEstudiantes[0].correo;
      } else if (!inputCarnet.value) {
        inputCarnet.value = defaultValidStudent.carnet;
        inputNombre.value = defaultValidStudent.nombre;
        inputCorreo.value = defaultValidStudent.correo;
      }

      updateMetrics();
      renderEstudiantes();
      renderMisionesFormList();
      renderCatalogGrid();
      updateGeneratedJson();
    } catch (err) {
      console.error('Error al cargar datos:', err);
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

  // Render Student Cards Grid
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
      const misionesHtml = (est.misiones || []).map(m => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-lg bg-[#e9efe4] text-[#617042] font-bold text-center flex items-center justify-center text-[11px]">
              ${m.misionId}
            </span>
            <div>
              <p class="font-bold text-slate-800">${m.nombre}</p>
              <p class="text-[11px] text-slate-500">${m.descripcion || ''}</p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
            m.estado ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600 border border-slate-300'
          }">
            <i class="fa-solid ${m.estado ? 'fa-check' : 'fa-clock'} mr-1"></i>
            ${m.estado ? 'Completada' : 'Pendiente'}
          </span>
        </div>
      `).join('');

      return `
        <div class="student-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div class="flex items-start justify-between gap-3">
              <div>
                <span class="inline-block bg-[#e9efe4] text-[#617042] font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-[#d5e0cb] mb-2">
                  <i class="fa-solid fa-id-card mr-1"></i> ${est.carnet}
                </span>
                <h3 class="text-base font-bold text-slate-900 leading-snug">${est.nombre}</h3>
                <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <i class="fa-solid fa-envelope text-slate-400"></i> ${est.correo}
                </p>
              </div>

              <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#e9efe4] text-[#617042]">
                ${porcentaje}% Avance
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4 space-y-1.5">
              <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Misiones: <strong>${est.misionesCompletadas}</strong> de ${est.misiones.length}</span>
                <span>${porcentaje}%</span>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                <div class="progress-fill h-full bg-[#b7c396] rounded-full" style="width: ${porcentaje}%"></div>
              </div>
            </div>
          </div>

          <!-- Misiones List -->
          <div class="space-y-2 border-t border-slate-100 pt-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalle de Misiones</h4>
            ${misionesHtml || '<p class="text-xs text-slate-400 italic">No hay misiones registradas.</p>'}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Misiones Form 3-Way Toggle Rows (Replicating Reference Site Image)
  function renderMisionesFormList() {
    misionesFormList.innerHTML = stateMisiones.map(m => {
      const id = m.MisionID || m.misionId;
      const currentState = missionStates[id] || 'no-enviar';

      return `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-md bg-[#e9efe4] text-[#617042] font-bold flex items-center justify-center text-xs">
              ${id}
            </span>
            <span class="font-bold text-slate-800">${m.Nombre || m.nombre}</span>
          </div>

          <!-- 3-Way Toggle Button Group -->
          <div class="toggle-group">
            <button type="button" class="toggle-btn ${currentState === 'no-enviar' ? 'active' : ''}" data-id="${id}" data-state="no-enviar">
              No enviar
            </button>
            <button type="button" class="toggle-btn ${currentState === 'pendiente' ? 'active' : ''}" data-id="${id}" data-state="pendiente">
              Pendiente
            </button>
            <button type="button" class="toggle-btn ${currentState === 'completada' ? 'active' : ''}" data-id="${id}" data-state="completada">
              Completada
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to 3-way toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'));
        const newState = btn.getAttribute('data-state');
        missionStates[id] = newState;

        renderMisionesFormList();
        if (!isDirectJsonEditMode) updateGeneratedJson();
      });
    });
  }

  // Update Generated JSON Code Box
  function updateGeneratedJson() {
    const detalle = [];
    Object.keys(missionStates).forEach(idKey => {
      const id = parseInt(idKey);
      const st = missionStates[id];
      if (st === 'pendiente') {
        detalle.push({ misionId: id, estado: false });
      } else if (st === 'completada') {
        detalle.push({ misionId: id, estado: true });
      }
    });

    const payload = {
      maestro: {
        carnet: inputCarnet.value.trim(),
        nombre: inputNombre.value.trim(),
        correo: inputCorreo.value.trim()
      },
      detalle
    };

    jsonEditor.value = JSON.stringify(payload, null, 2);
  }

  // Render Catalog Grid
  function renderCatalogGrid() {
    catalogGrid.innerHTML = stateMisiones.map(m => `
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 shadow-sm">
        <span class="bg-[#b7c396] text-slate-900 font-bold px-3 py-1 rounded-lg text-xs font-mono">
          ID: ${m.MisionID || m.misionId}
        </span>
        <div>
          <h4 class="text-sm font-bold text-slate-900">${m.Nombre || m.nombre}</h4>
          <p class="text-xs text-slate-500 mt-0.5">${m.Descripcion || m.descripcion || 'Sin descripción'}</p>
        </div>
      </div>
    `).join('');
  }

  // Submit POST Request
  async function handlePostSubmission() {
    let payload;
    try {
      payload = JSON.parse(jsonEditor.value);
    } catch (e) {
      alert('Error: El texto en el editor no es un JSON válido.');
      return;
    }

    const startTime = Date.now();
    btnSubmitForm.disabled = true;
    btnSubmitForm.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando...`;

    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const elapsed = Date.now() - startTime;
      const jsonRes = await response.json();

      responseContainer.classList.remove('hidden');
      resTimeBadge.textContent = `${elapsed} ms`;

      if (response.ok) {
        responseContainer.className = 'rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-mono text-emerald-900';
        resStatusBadge.textContent = `HTTP ${response.status} OK`;
        resBodyContent.textContent = JSON.stringify(jsonRes, null, 2);

        // Reload data to reflect new student / updated mission states
        loadData();
      } else {
        responseContainer.className = 'rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-mono text-rose-900';
        resStatusBadge.textContent = `HTTP ${response.status} Error`;
        resBodyContent.textContent = JSON.stringify(jsonRes, null, 2);
      }
    } catch (err) {
      responseContainer.classList.remove('hidden');
      responseContainer.className = 'rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-mono text-rose-900';
      resStatusBadge.textContent = `ERROR DE RED`;
      resBodyContent.textContent = err.message;
    } finally {
      btnSubmitForm.disabled = false;
      btnSubmitForm.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar avance (POST)`;
    }
  }
});
