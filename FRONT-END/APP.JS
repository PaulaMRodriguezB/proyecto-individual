document.addEventListener('DOMContentLoaded', () => {
  // --- ESTADO LOCAL Y DOM ---
  let tareas = JSON.parse(localStorage.getItem('tareas_db')) || [];

  const modalElement = document.getElementById('modalAgregarTarea');
  const bsModal = new bootstrap.Modal(modalElement);

  const filtroFecha = document.getElementById('filtroFechaCalendario');
  const btnVerHoy = document.getElementById('btnVerHoy');
  const cuerpoTabla = document.getElementById('cuerpoTablaTareas');
  const listaHechas = document.getElementById('listaTareasHechas');
  const campoRapido = document.getElementById('campoTareaRapida');
  const btnAbrirModal = document.getElementById('botonAbrirModal');
  const formModal = document.getElementById('formularioModalTarea');
  const alertaError = document.getElementById('alertaError');
  const textoFechaActual = document.getElementById('textoFechaActual');
  const barraProgreso = document.getElementById('barraProgresoVerde');
  const textoPorcentaje = document.getElementById('textoPorcentajeCumplimiento');

  const obtenerFechaHoy = () => new Date().toISOString().split('T')[0];
  filtroFecha.value = obtenerFechaHoy();

  // --- PASO 2.2: FUNCIÓN EXIGIDA POR SPRINT 1 ---
  const validFormFieldInput = (data) => {
    // Paso 2.4: Comprobar por consola
    console.log("Validando campos del formulario:", data);

    // Retorna false si falta algún campo obligatorio (Paso 2.5 Tabla)
    if (!data.nombre || data.nombre.trim() === '') return false;
    if (!data.descripcion || data.descripcion.trim() === '') return false;
    if (!data.fecha || data.fecha.trim() === '') return false;
    if (!data.estado || data.estado.trim() === '') return false;

    return true;
  };

  // --- LÓGICA RENDERIZAR TAREAS ---
  const actualizarApp = () => {
    localStorage.setItem('tareas_db', JSON.stringify(tareas));
    renderizarTareas();
  };

  const renderizarTareas = () => {
    const fechaFiltro = filtroFecha.value;
    textoFechaActual.textContent = fechaFiltro === obtenerFechaHoy() ? 'HOY' : fechaFiltro;

    cuerpoTabla.innerHTML = '';
    listaHechas.innerHTML = '';

    const tareasDelDia = tareas.filter(t => t.fecha === fechaFiltro);
    const pendientes = tareasDelDia.filter(t => !t.completada);
    const completadas = tareasDelDia.filter(t => t.completada);

    // Estadísticas
    const total = tareasDelDia.length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas.length / total) * 100);
    barraProgreso.style.width = `${porcentaje}%`;
    textoPorcentaje.textContent = `${porcentaje}%`;

    // Render Tabla Izquierda
    if (pendientes.length === 0) {
      cuerpoTabla.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-3" style="font-size:0.85rem;">
            No hay tareas pendientes para esta fecha.
          </td>
        </tr>`;
    } else {
      pendientes.forEach(tarea => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <input type="checkbox" class="form-check-input" onchange="commutarTarea('${tarea.id}')">
          </td>
          <td class="fw-semibold">${tarea.nombre}</td>
          <td class="text-muted small">${tarea.descripcion || '-'}</td>
          <td><span class="badge bg-light text-dark border">${tarea.fecha}</span></td>
          <td class="text-end">
            <button class="btn btn-sm btn-link text-danger p-0" onclick="eliminarTarea('${tarea.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;
        cuerpoTabla.appendChild(tr);
      });
    }

    // Render Tareas Hechas
    if (completadas.length === 0) {
      listaHechas.innerHTML = `<span class="text-muted small text-center d-block py-2">Sin tareas completadas</span>`;
    } else {
      completadas.forEach(tarea => {
        const item = document.createElement('div');
        item.className = 'item-tarea-hecha';
        item.innerHTML = `
          <button class="boton-devolver-verde" onclick="commutarTarea('${tarea.id}')" title="Devolver a pendientes">
            <i class="bi bi-arrow-return-left text-white" style="font-size: 11px;"></i>
          </button>
          <div class="caja-texto-hecha">${tarea.nombre}</div>
          <button class="btn btn-sm text-danger p-0" onclick="eliminarTarea('${tarea.id}')"><i class="bi bi-x-lg"></i></button>
        `;
        listaHechas.appendChild(item);
      });
    }
  };

  const agregarTarea = (nombre, descripcion, fecha, estado) => {
    tareas.push({
      id: Date.now().toString(),
      nombre,
      descripcion,
      fecha,
      estado,
      completada: false
    });
    actualizarApp();
  };

  window.commutarTarea = (id) => {
    tareas = tareas.map(t => t.id === id ? { ...t, completada: !t.completada } : t);
    actualizarApp();
  };

  window.eliminarTarea = (id) => {
    tareas = tareas.filter(t => t.id !== id);
    actualizarApp();
  };

  // --- LÓGICA DEL FORMULARIO Y MUESTRA DE ERRORES (PASO 3) ---
  formModal.addEventListener('submit', (e) => {
    e.preventDefault();

    // Capturar usando id (Paso 2.3)
    const datosFormulario = {
      nombre: document.querySelector('#newTaskNameInput').value,
      descripcion: document.querySelector('#newTaskDescriptionInput').value,
      fecha: document.querySelector('#newTaskDueDateInput').value,
      estado: document.querySelector('#newTaskStatusInput').value
    };

    // Validar datos
    if (!validFormFieldInput(datosFormulario)) {
      alertaError.classList.remove('d-none'); // Mostrar alerta
    } else {
      alertaError.classList.add('d-none'); // Ocultar alerta si es correcto
      
      agregarTarea(
        datosFormulario.nombre,
        datosFormulario.descripcion,
        datosFormulario.fecha,
        datosFormulario.estado
      );

      formModal.reset();
      bsModal.hide();
    }
  });

  // --- TIMER POMODORO ---
  let tiempoTrabajo = 25 * 60;
  let tiempoDescanso = 5 * 60;
  let tiempoRestante = tiempoTrabajo;
  let timerInterval = null;
  let enEnfoque = true;

  const pantalla = document.getElementById('pantallaPomodoro');
  const btnPlayPause = document.getElementById('btnPlayPausePomodoro');
  const btnReset = document.getElementById('btnResetPomodoro');
  const iconoPlayPause = document.getElementById('iconoPlayPause');
  const estadoTexto = document.getElementById('estadoPomodoro');

  const actualizarPantallaPomodoro = () => {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    pantalla.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  btnPlayPause.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      iconoPlayPause.className = 'bi bi-play-fill text-white';
    } else {
      iconoPlayPause.className = 'bi bi-pause-fill text-white';
      timerInterval = setInterval(() => {
        tiempoRestante--;
        actualizarPantallaPomodoro();

        if (tiempoRestante <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          enEnfoque = !enEnfoque;
          tiempoRestante = enEnfoque ? tiempoTrabajo : tiempoDescanso;
          estadoTexto.textContent = enEnfoque ? 'TIEMPO DE ENFOQUE' : 'TIEMPO DE DESCANSO';
          iconoPlayPause.className = 'bi bi-play-fill text-white';
          actualizarPantallaPomodoro();
        }
      }, 1000);
    }
  });

  btnReset.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    enEnfoque = true;
    tiempoRestante = tiempoTrabajo;
    estadoTexto.textContent = 'TIEMPO DE ENFOQUE';
    iconoPlayPause.className = 'bi bi-play-fill text-white';
    actualizarPantallaPomodoro();
  });

  // --- EVENTOS ADICIONALES ---
  campoRapido.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && campoRapido.value.trim() !== '') {
      agregarTarea(campoRapido.value.trim(), 'Tarea rápida', filtroFecha.value, 'Por Hacer');
      campoRapido.value = '';
    }
  });

  btnAbrirModal.addEventListener('click', () => {
    document.getElementById('newTaskDueDateInput').value = filtroFecha.value;
    alertaError.classList.add('d-none');
    bsModal.show();
  });

  filtroFecha.addEventListener('change', renderizarTareas);

  btnVerHoy.addEventListener('click', () => {
    filtroFecha.value = obtenerFechaHoy();
    renderizarTareas();
  });

  // Inicializar vista
  renderizarTareas();
});