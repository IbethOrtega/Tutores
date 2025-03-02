/* ================================
   AUTENTICACIÓN
================================ */
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    // Autenticación dummy: usuario "admin", contraseña "admin"
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isLoggedIn", "true");
      document.getElementById('loginModal').classList.remove('active');
      document.getElementById('appContainer').style.display = 'block';
      showToast("Inicio de sesión exitoso", "success");
    } else {
      showToast("Credenciales incorrectas", "error");
    }
  }
  
  function checkSession() {
    if (localStorage.getItem("isLoggedIn") === "true") {
      document.getElementById('loginModal').classList.remove('active');
      document.getElementById('appContainer').style.display = 'block';
    } else {
      document.getElementById('loginModal').classList.add('active');
    }
  }
  
  function logout() {
    localStorage.removeItem("isLoggedIn");
    location.reload();
  }
  
  window.onload = checkSession;
  
  /* ================================
     TOAST NOTIFICATIONS
  ================================ */
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (type === "error") {
      toast.style.background = "#e74c3c";
    } else if (type === "success") {
      toast.style.background = "#27ae60";
    }
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }
  
  /* ================================
     GESTIÓN DE DATOS
  ================================ */
  let servicios = JSON.parse(localStorage.getItem('servicios')) || [];
  let pendientes = JSON.parse(localStorage.getItem('pendientes')) || [];
  let editMode = { active: false, esPendiente: true, codigo: null };
  
  function validarCampos(tipo, codigo, valor, fecha) {
    if (!tipo || !codigo || !valor || !fecha) {
      showToast("Completa todos los campos", "error");
      return false;
    }
    if (!editMode.active) {
      const exists = pendientes.concat(servicios).some(s => s.codigo === codigo);
      if (exists) {
        showToast("El código ya existe", "error");
        return false;
      }
    }
    return true;
  }
  
  function parseDateLocal(dateStr) {
    const parts = dateStr.split("-");
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  
  function guardarTrabajo() {
    const tipo = document.getElementById('tipoServicio').value;
    const codigo = document.getElementById('codigo').value.trim();
    const valor = document.getElementById('valor').value;
    const fecha = document.getElementById('fecha').value;
  
    if (!validarCampos(tipo, codigo, valor, fecha)) return;
  
    if (editMode.active) {
      if (editMode.esPendiente) {
        pendientes = pendientes.map(s => s.codigo === editMode.codigo ? { tipo, codigo, valor, fecha, entregado: s.entregado } : s);
      } else {
        servicios = servicios.map(s => s.codigo === editMode.codigo ? { tipo, codigo, valor, fecha } : s);
      }
      editMode = { active: false, esPendiente: true, codigo: null };
      showToast("Registro actualizado", "success");
    } else {
      pendientes.push({ tipo, codigo, valor, fecha, entregado: false });
      showToast("Trabajo agregado", "success");
    }
    guardarDatos();
    actualizarTodo();
    limpiarFormulario();
  
    const newDate = parseDateLocal(fecha);
    if (newDate.getDate() <= 15) {
      document.getElementById('tabla-pendientes-q1').scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('tabla-pendientes-q2').scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  function limpiarFormulario() {
    document.getElementById('tipoServicio').value = '';
    document.getElementById('codigo').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('fecha').value = '';
  }
  
  function marcarComoPagado(codigo) {
    const index = pendientes.findIndex(s => s.codigo === codigo);
    if (index !== -1) {
      const [trabajo] = pendientes.splice(index, 1);
      servicios.push(trabajo);
      showToast("Trabajo marcado como pagado", "success");
      guardarDatos();
      actualizarTodo();
    }
  }
  
  function marcarComoEntregado(codigo) {
    const trabajo = pendientes.find(s => s.codigo === codigo);
    if (trabajo) {
      trabajo.entregado = true;
      showToast("Trabajo marcado como entregado", "success");
      guardarDatos();
      actualizarTodo();
    }
  }
  
  function editarServicio(codigo, esPendiente = true) {
    const trabajo = esPendiente ? pendientes.find(s => s.codigo === codigo) : servicios.find(s => s.codigo === codigo);
    if (trabajo) {
      document.getElementById('tipoServicio').value = trabajo.tipo;
      document.getElementById('codigo').value = trabajo.codigo;
      document.getElementById('valor').value = trabajo.valor;
      document.getElementById('fecha').value = trabajo.fecha;
      editMode = { active: true, esPendiente, codigo };
      document.getElementById('tipoServicio').scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  function eliminarServicio(codigo, esPendiente = true) {
    if (!confirm('¿Eliminar este registro?')) return;
    if (esPendiente) {
      pendientes = pendientes.filter(s => s.codigo !== codigo);
    } else {
      servicios = servicios.filter(s => s.codigo !== codigo);
    }
    showToast("Registro eliminado", "error");
    guardarDatos();
    actualizarTodo();
  }
  
  function filtrarTrabajos() {
    const codigoBuscado = document.getElementById('buscarCodigo').value.trim();
    const tipoFiltrado = document.getElementById('filtrarTipo').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
  
    let resultadosPendientes = pendientes.filter(s => {
      let match = true;
      if (codigoBuscado) match = match && s.codigo.includes(codigoBuscado);
      if (tipoFiltrado) match = match && s.tipo === tipoFiltrado;
      if (fechaInicio) match = match && parseDateLocal(s.fecha) >= new Date(fechaInicio);
      if (fechaFin) match = match && parseDateLocal(s.fecha) <= new Date(fechaFin);
      return match;
    });
    let resultadosServicios = servicios.filter(s => {
      let match = true;
      if (codigoBuscado) match = match && s.codigo.includes(codigoBuscado);
      if (tipoFiltrado) match = match && s.tipo === tipoFiltrado;
      if (fechaInicio) match = match && parseDateLocal(s.fecha) >= new Date(fechaInicio);
      if (fechaFin) match = match && parseDateLocal(s.fecha) <= new Date(fechaFin);
      return match;
    });
  
    actualizarTablas(resultadosPendientes, resultadosServicios);
  
    if (resultadosPendientes.length > 0) {
      document.getElementById('tabla-pendientes-q1').scrollIntoView({ behavior: 'smooth' });
    } else if (resultadosServicios.length > 0) {
      document.getElementById('lista-servicios').scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  function limpiarFiltros() {
    document.getElementById('buscarCodigo').value = '';
    document.getElementById('filtrarTipo').value = '';
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    actualizarTodo();
  }
  
  function actualizarTodo() {
    actualizarEstadisticasGlobales();
    actualizarTablas();
  }
  
  /* Actualiza las estadísticas globales; ahora se muestran las ventas totales (todos los registros) */
  function actualizarEstadisticasGlobales() {
    document.getElementById('total-servicios').textContent = servicios.length;
    const totalPagado = servicios.reduce((acc, s) => acc + Number(s.valor), 0);
    document.getElementById('ganancias-totales').textContent = `$${totalPagado.toLocaleString()}`;
    const pendienteQ1 = pendientes.filter(s => parseDateLocal(s.fecha).getDate() <= 15)
      .reduce((acc, s) => acc + Number(s.valor), 0);
    const pendienteQ2 = pendientes.filter(s => parseDateLocal(s.fecha).getDate() > 15)
      .reduce((acc, s) => acc + Number(s.valor), 0);
    document.getElementById('pendiente-q1').textContent = `$${pendienteQ1.toLocaleString()}`;
    document.getElementById('pendiente-q2').textContent = `$${pendienteQ2.toLocaleString()}`;
  
    // Se muestran todas las ventas (sin filtrar por mes)
    const totalVentas = servicios.reduce((acc, s) => acc + Number(s.valor), 0);
    document.getElementById('total-mes').textContent = `$${totalVentas.toLocaleString()}`;
  }
  
  function actualizarTablas(filtradosPendientes = pendientes, filtradosServicios = servicios) {
    const pendientesQ1 = filtradosPendientes.filter(s => parseDateLocal(s.fecha).getDate() <= 15);
    const pendientesQ2 = filtradosPendientes.filter(s => parseDateLocal(s.fecha).getDate() > 15);
  
    // Generar filas para Quincena 1 (solo Código y Valor)
    document.querySelector('#tabla-pendientes-q1 tbody').innerHTML = pendientesQ1.map(s => `
      <tr>
        <td>${s.codigo}</td>
        <td>$${Number(s.valor).toLocaleString()}</td>
        <td>
          <button class="accion-btn" onclick="marcarComoPagado('${s.codigo}')">✅</button>
          <button class="accion-btn" onclick="marcarComoEntregado('${s.codigo}')">
            ${s.entregado ? '✔️' : '📦'}
          </button>
          <button class="accion-btn" onclick="editarServicio('${s.codigo}', true)">✏️</button>
          <button class="accion-btn" onclick="eliminarServicio('${s.codigo}', true)">🗑️</button>
        </td>
      </tr>
    `).join('');
  
    // Generar filas para Quincena 2 (solo Código y Valor)
    document.querySelector('#tabla-pendientes-q2 tbody').innerHTML = pendientesQ2.map(s => `
      <tr>
        <td>${s.codigo}</td>
        <td>$${Number(s.valor).toLocaleString()}</td>
        <td>
          <button class="accion-btn" onclick="marcarComoPagado('${s.codigo}')">✅</button>
          <button class="accion-btn" onclick="marcarComoEntregado('${s.codigo}')">
            ${s.entregado ? '✔️' : '📦'}
          </button>
          <button class="accion-btn" onclick="editarServicio('${s.codigo}', true)">✏️</button>
          <button class="accion-btn" onclick="eliminarServicio('${s.codigo}', true)">🗑️</button>
        </td>
      </tr>
    `).join('');
  
    // Actualizar los encabezados de las quincenas con el rango de fechas
    updateHeaderDate("header-q1", pendientesQ1);
    updateHeaderDate("header-q2", pendientesQ2);
  
    // Actualizar "Trabajos Pagados" agrupados por quincena y mes
    let grupos = {};
    filtradosServicios.forEach(s => {
      const f = parseDateLocal(s.fecha);
      const quincena = f.getDate() <= 15 ? "Quincena 1" : "Quincena 2";
      const month = f.toLocaleString("es-ES", { month: "long" });
      const year = f.getFullYear();
      const key = `${quincena} ${month} ${year}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(s);
    });
  
    let keys = Object.keys(grupos);
    const monthMap = {
      "enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
      "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
      "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
    };
    keys.sort((a, b) => {
      let partsA = a.split(" ");
      let partsB = b.split(" ");
      let yearA = parseInt(partsA[3]);
      let yearB = parseInt(partsB[3]);
      if (yearA !== yearB) return yearB - yearA;
      let monthA = monthMap[partsA[2].toLowerCase()] || 0;
      let monthB = monthMap[partsB[2].toLowerCase()] || 0;
      if (monthA !== monthB) return monthB - monthA;
      let quincenaA = parseInt(partsA[1]);
      let quincenaB = parseInt(partsB[1]);
      return quincenaB - quincenaA;
    });
  
    let htmlGrupos = "";
    keys.forEach(key => {
      const totalGrupo = grupos[key].reduce((acc, s) => acc + Number(s.valor), 0);
      let groupId = "grupo_" + key.replace(/\s+/g, "_");
      htmlGrupos += `
        <div id="${groupId}" class="grupo-pagado">
          <h3 class="grupo-header" onclick="toggleGroup(this)">${key} - Total: $${totalGrupo.toLocaleString()}</h3>
          <div class="group-content">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${grupos[key].map(s => `
                  <tr>
                    <td>${s.codigo}</td>
                    <td>$${Number(s.valor).toLocaleString()}</td>
                    <td>
                      <button class="accion-btn" onclick="editarServicio('${s.codigo}', false)">✏️</button>
                      <button class="accion-btn" onclick="eliminarServicio('${s.codigo}', false)">🗑️</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
    document.getElementById('lista-servicios').innerHTML = htmlGrupos;
  }
  
  function updateHeaderDate(headerId, tasks) {
    const headerElement = document.getElementById(headerId);
    if (!headerElement) return;
    if (tasks.length === 0) {
      headerElement.textContent = headerElement.textContent.split(" (")[0];
      return;
    }
    const dates = tasks.map(s => parseDateLocal(s.fecha));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    let dateRange = minDate.toLocaleDateString();
    if (minDate.toLocaleDateString() !== maxDate.toLocaleDateString()) {
      dateRange = `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
    }
    const baseText = headerElement.textContent.split(" (")[0];
    headerElement.textContent = `${baseText} (Fecha: ${dateRange})`;
  }
  
  function guardarDatos() {
    localStorage.setItem('servicios', JSON.stringify(servicios));
    localStorage.setItem('pendientes', JSON.stringify(pendientes));
  }
  
  /* ================================
     EXPORTACIONES
  ================================ */
  function exportarCSV() {
    const header = ['Estado', 'Tipo', 'Código', 'Valor', 'Fecha'].join(',');
    const datosPagados = servicios.map(s => ['pagado', s.tipo, s.codigo, s.valor, s.fecha].join(','));
    const datosPendientes = pendientes.map(s => ['pendiente', s.tipo, s.codigo, s.valor, s.fecha].join(','));
    const csvContent = [header, ...datosPagados, ...datosPendientes].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-trabajos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function exportarJSON() {
    const db = { servicios, pendientes };
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base-datos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Importar JSON
  document.getElementById('importarJSON').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const db = JSON.parse(e.target.result);
        servicios = Array.isArray(db.servicios) ? db.servicios : [];
        pendientes = Array.isArray(db.pendientes) ? db.pendientes : [];
        guardarDatos();
        actualizarTodo();
        showToast("Base de datos importada correctamente", "success");
      } catch (error) {
        console.error(error);
        showToast("Error al importar el archivo JSON", "error");
      }
    }
    reader.readAsText(file);
  });
  
  // Importar CSV
  document.getElementById('importarCSV').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim().length > 0);
        if (lines[0].toLowerCase().includes("estado")) {
          lines.shift();
        }
        servicios = [];
        pendientes = [];
        lines.forEach(line => {
          const parts = line.split(',').map(p => p.trim());
          if (parts.length < 5) return;
          const [estado, tipo, codigo, valor, fecha] = parts;
          if (!tipo) return;
          const registro = { tipo, codigo, valor, fecha, entregado: false };
          if (estado.toLowerCase() === 'pagado') {
            servicios.push(registro);
          } else {
            pendientes.push(registro);
          }
        });
        guardarDatos();
        actualizarTodo();
        showToast(`Importación exitosa: ${lines.length} registros cargados`, "success");
      } catch (error) {
        console.error(error);
        showToast("Error al importar el archivo CSV", "error");
      }
    }
    reader.readAsText(file);
  });
  
  function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Trabajos Académicos", 10, 20);
    doc.setFontSize(12);
    doc.text(`Total Trabajos Pagados: ${servicios.length}`, 10, 40);
    const totalPagado = servicios.reduce((acc, s) => acc + Number(s.valor), 0);
    doc.text(`Ganancias Totales: $${totalPagado.toLocaleString()}`, 10, 50);
    const pendienteQ1 = pendientes.filter(s => parseDateLocal(s.fecha).getDate() <= 15)
      .reduce((acc, s) => acc + Number(s.valor), 0);
    const pendienteQ2 = pendientes.filter(s => parseDateLocal(s.fecha).getDate() > 15)
      .reduce((acc, s) => acc + Number(s.valor), 0);
    doc.text(`Pendiente Quincena 1: $${pendienteQ1.toLocaleString()}`, 10, 60);
    doc.text(`Pendiente Quincena 2: $${pendienteQ2.toLocaleString()}`, 10, 70);
    doc.save(`reporte-${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  /* ================================
     CAMBIO DE VISTAS
  ================================ */
  function mostrarEstadisticas() {
    document.getElementById('view-main').style.display = "none";
    document.getElementById('view-stats').style.display = "block";
    document.getElementById('btn-ver-stats').style.display = "none";
    document.getElementById('btn-ver-main').style.display = "block";
    actualizarEstadisticasGlobales();
    actualizarCharts();
  }
  
  function mostrarMain() {
    document.getElementById('view-stats').style.display = "none";
    document.getElementById('view-main').style.display = "block";
    document.getElementById('btn-ver-main').style.display = "none";
    document.getElementById('btn-ver-stats').style.display = "block";
  }
  
  /* ================================
     GRÁFICOS CON CHART.JS (TODOS LOS DATOS)
  ================================ */
  let chartLine, chartBar, chartPie;
  function actualizarCharts() {
    // Usar todas las ventas (sin filtrar por mes)
    const trabajos = servicios;
    // Agrupar ventas por fecha única (formato local)
    const fechasUnicas = [...new Set(trabajos.map(s => parseDateLocal(s.fecha).toLocaleDateString()))].sort((a, b) => new Date(a) - new Date(b));
    const gananciasPorFecha = fechasUnicas.map(fecha =>
      trabajos.filter(s => parseDateLocal(s.fecha).toLocaleDateString() === fecha)
        .reduce((acc, s) => acc + Number(s.valor), 0)
    );
  
    if (chartLine) {
      chartLine.data.labels = fechasUnicas;
      chartLine.data.datasets[0].data = gananciasPorFecha;
      chartLine.update();
    } else {
      const ctxLine = document.getElementById('chart-line').getContext('2d');
      chartLine = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: fechasUnicas,
          datasets: [{
            label: 'Ganancias por día',
            data: gananciasPorFecha,
            backgroundColor: 'rgba(74, 144, 226, 0.2)',
            borderColor: 'rgba(74, 144, 226, 1)',
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'Ganancias' } }
          }
        }
      });
    }
  
    // Gráficos de barras y pastel agrupados por tipo (para todas las ventas)
    const tipos = ["1", "2", "3", "4", "5", "6"];
    const gananciasPorTipo = tipos.map(tipo =>
      trabajos.filter(s => s.tipo === tipo)
        .reduce((acc, s) => acc + Number(s.valor), 0)
    );
  
    if (chartBar) {
      chartBar.data.labels = tipos;
      chartBar.data.datasets[0].data = gananciasPorTipo;
      chartBar.update();
    } else {
      const ctxBar = document.getElementById('chart-bar').getContext('2d');
      chartBar = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: tipos,
          datasets: [{
            label: 'Ganancias por tipo',
            data: gananciasPorTipo,
            backgroundColor: ['#34495e', '#2ecc71', '#e67e22', '#e74c3c', '#9b59b6', '#f1c40f']
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Ganancias' } }
          }
        }
      });
    }
  
    if (chartPie) {
      chartPie.data.labels = tipos;
      chartPie.data.datasets[0].data = gananciasPorTipo;
      chartPie.update();
    } else {
      const ctxPie = document.getElementById('chart-pie').getContext('2d');
      chartPie = new Chart(ctxPie, {
        type: 'pie',
        data: {
          labels: tipos,
          datasets: [{
            label: 'Distribución por tipo',
            data: gananciasPorTipo,
            backgroundColor: ['#34495e', '#2ecc71', '#e67e22', '#e74c3c', '#9b59b6', '#f1c40f']
          }]
        }
      });
    }
  }
  
  /* ================================
     GUARDAR DATOS EN LOCALSTORAGE
  ================================ */
  function guardarDatos() {
    localStorage.setItem('servicios', JSON.stringify(servicios));
    localStorage.setItem('pendientes', JSON.stringify(pendientes));
  }
  
  /* ================================
     INICIALIZACIÓN
  ================================ */
  actualizarTodo();
  