document.addEventListener('DOMContentLoaded', () => {
  // Instancia principal de TaskManager (Tarea 4 & 5)
  const taskManager = new TaskManager();
  taskManager.load();

  // Elementos DOM
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

  // Función exigida por Sprint 1 / Tarea 5
  const validFormFieldInput = (data) => {
    console.log("Validando campos del formulario:", data);
    if (!data.nombre || data.nombre.trim() === '') return false;
    if (!data.descripcion || data.descripcion.trim() === '') return false;
    if (!data.fecha || data.fecha.trim() === '') return false;
    if (!data.estado || data.estado.trim() === '') return false;

    return true;
  };

  // Lógica para renderizar las tareas
  const renderizarTareas = () => {
    const fechaFiltro = filtroFecha.value;
    textoFechaActual.textContent = fechaFiltro === obtenerFechaHoy() ? 'HOY' : fechaFiltro;

    cuerpoTabla.innerHTML = '';
    listaHechas.innerHTML = '';

    const tareasDelDia = taskManager.tasks.filter(t => t.dueDate === fechaFiltro);
    const pendientes = tareasDelDia.filter(t => !t.completada);
    const completadas = tareasDelDia.filter(t => t.completada);

    // Estadísticas
    const total = tareasDelDia.length;
    const porcentaje = total === 0 ? 0 : Math.round((completadas.length / total) * 100);
    barraProgreso.style.width = `${porcentaje}%`;
    textoPorcentaje.textContent = `${porcentaje}%`;

    // Render Tabla Pendientes (Atributo data-task-id y clase delete-button exigidos)
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
        tr.dataset.taskId = tarea.id; // Asignación data-task-id
        tr.innerHTML = `
          <td>
            <input type="checkbox" class="form-check-input check-task" ${tarea.completada ? 'checked' : ''}>
          </td>
          <td class="fw-semibold">${tarea.name}</td>
          <td class="text-muted small">${tarea.description || '-'}</td>
          <td><span class="badge bg-light text-dark border">${tarea.dueDate}</span></td>
          <td class="text-end">
            <button class="btn btn-sm btn-link text-danger p-0 delete-button" title="Eliminar tarea">
              <i class="bi bi-trash pointer-events-none"></i>
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
        item.dataset.taskId = tarea.id; // Asignación data-task-id
        item.innerHTML = `
          <button class="boton-devolver-verde toggle-task" title="Devolver a pendientes">
            <i class="bi bi-arrow-return-left text-white pointer-events-none" style="font-size: 11px;"></i>
          </button>
          <div class="caja-texto-hecha">${tarea.name}</div>
          <button class="btn btn-sm text-danger p-0 delete-button" title="Eliminar tarea">
            <i class="bi bi-x-lg pointer-events-none"></i>
          </button>
        `;
        listaHechas.appendChild(item);
      });
    }
    actualizarOpcionesTareas();
  };
  

  // Delegación de eventos para Eliminar (Tarea 6) y Cambiar estado (Tarea 4)
  document.addEventListener('click', (event) => {
    const parentTask = event.target.closest('[data-task-id]');
    if (!parentTask) return;

    const taskId = Number(parentTask.dataset.taskId);

    // Detección de botón de eliminar (Clase exige: delete-button)
    if (event.target.classList.contains('delete-button') || event.target.closest('.delete-button')) {
      taskManager.deleteTask(taskId);
      renderizarTareas();
    }

    // Detección de checkbox o botón para cambiar estado completado
    if (event.target.classList.contains('check-task') || event.target.closest('.toggle-task')) {
      taskManager.toggleTaskStatus(taskId);
      renderizarTareas();
    }
  });

  // Envío del Formulario Modal (Tarea 5)
  formModal.addEventListener('submit', (e) => {
    e.preventDefault();

    const datosFormulario = {
      nombre: document.querySelector('#newTaskNameInput').value,
      descripcion: document.querySelector('#newTaskDescriptionInput').value,
      fecha: document.querySelector('#newTaskDueDateInput').value,
      estado: document.querySelector('#newTaskStatusInput').value
    };

    if (!validFormFieldInput(datosFormulario)) {
      alertaError.classList.remove('d-none');
    } else {
      alertaError.classList.add('d-none');

      // Uso del método addTask del TaskManager
      taskManager.addTask(
        datosFormulario.nombre,
        datosFormulario.descripcion,
        datosFormulario.fecha,
        datosFormulario.estado
      );

      formModal.reset();
      bsModal.hide();
      renderizarTareas();
    }
  });

  // Entrada rápida de tarea
  campoRapido.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && campoRapido.value.trim() !== '') {
      taskManager.addTask(
        campoRapido.value.trim(),
        'Tarea rápida',
        filtroFecha.value,
        'PORHACER'
      );
      campoRapido.value = '';
      renderizarTareas();
    }
  });

// --- LÓGICA Y PERSISTENCIA POMODORO ---
const selectTarea = document.getElementById('selectTareaPomodoro');

  const actualizarOpcionesTareas = () => {
    if (!selectTarea) return;

    const valorSeleccionado = selectTarea.value;
    selectTarea.innerHTML = '<option value="">-- Selecciona una tarea activa --</option>';

    if (taskManager && Array.isArray(taskManager.tasks)) {
      taskManager.tasks.forEach(tarea => {
        if (!tarea.completada) {
          const option = document.createElement('option');
          option.value = tarea.name; 
          option.textContent = tarea.name;
          selectTarea.appendChild(option);
        }
      });
    }

    selectTarea.value = valorSeleccionado;
  };

  if (selectTarea) {
    selectTarea.addEventListener('focus', actualizarOpcionesTareas);
  }
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
const btnAbrirResumen = document.getElementById('btnAbrirResumenPomodoro');

// Obtener fecha actual formato YYYY-MM-DD
const getFechaHoy = () => new Date().toISOString().split('T')[0];

// Cargar o inicializar datos de Pomodoro en LocalStorage
const obtenerDatosPomodoro = () => {
  const datos = JSON.parse(localStorage.getItem('pomodoro_stats')) || {};
  const hoy = getFechaHoy();
  if (!datos[hoy]) {
    datos[hoy] = {
      segundosEnfoque: 0,
      sesionesCompletadas: 0,
      descansosRealizados: 0,
      historial: []
    };
  }
  return { datos, hoy };
};

// Registrar tiempo activo en LocalStorage
const registrarSegundoPomodoro = () => {
  const { datos, hoy } = obtenerDatosPomodoro();
  if (enEnfoque) {
    datos[hoy].segundosEnfoque += 1;
  }
  localStorage.setItem('pomodoro_stats', JSON.stringify(datos));
};

// Actualizar reloj en pantalla
const actualizarPantallaPomodoro = () => {
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  pantalla.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
};

// Control de Play / Pausa
// Control de Play / Pausa
btnPlayPause.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    iconoPlayPause.className = 'bi bi-play-fill text-white';
  } else {
    iconoPlayPause.className = 'bi bi-pause-fill text-white';
    timerInterval = setInterval(() => {
      tiempoRestante--;
      registrarSegundoPomodoro(); 
      actualizarPantallaPomodoro();

      // Guardar sesión al finalizar el tiempo
      if (tiempoRestante <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;

        const { datos, hoy } = obtenerDatosPomodoro();
        const horaFin = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const tareaNombre = (selectTarea && selectTarea.value) ? selectTarea.value : 'Tarea general';

        if (enEnfoque) {
          datos[hoy].sesionesCompletadas += 1;
          datos[hoy].historial.push({ 
            tipo: 'Enfoque', 
            hora: horaFin, 
            duracion: '25 min', 
            tarea: tareaNombre 
          });
          enEnfoque = false;
          tiempoRestante = tiempoDescanso;
          estadoTexto.textContent = 'TIEMPO DE DESCANSO';
        } else {
          datos[hoy].descansosRealizados += 1;
          datos[hoy].historial.push({ 
            tipo: 'Descanso', 
            hora: horaFin, 
            duracion: '5 min' 
          });
          enEnfoque = true;
          tiempoRestante = tiempoTrabajo;
          estadoTexto.textContent = 'TIEMPO DE ENFOQUE';
        }

        localStorage.setItem('pomodoro_stats', JSON.stringify(datos));
        iconoPlayPause.className = 'bi bi-play-fill text-white';
        actualizarPantallaPomodoro();
      }
    }, 1000);
  }
});
// Control de Reset
btnReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  enEnfoque = true;
  tiempoRestante = tiempoTrabajo;
  estadoTexto.textContent = 'TIEMPO DE ENFOQUE';
  iconoPlayPause.className = 'bi bi-play-fill text-white';
  actualizarPantallaPomodoro();
});

// Renderizar datos del Modal Resumen
const renderizarModalResumen = () => {
  const { datos, hoy } = obtenerDatosPomodoro();
  const infoHoy = datos[hoy];

  const minutosTrabajados = Math.floor(infoHoy.segundosEnfoque / 60);
  document.getElementById('minutosEnfoqueAcumulados').textContent = minutosTrabajados;
  document.getElementById('tiempoTotalActivoTexto').textContent = `${minutosTrabajados} min`;
  document.getElementById('cantSesionesCompletadas').textContent = infoHoy.sesionesCompletadas;
  document.getElementById('cantDescansosRealizados').textContent = infoHoy.descansosRealizados;

  // Porcentaje estimado de meta (Ejemplo: Meta diaria 3 sesiones = 75 min)
  const porcentaje = Math.min(Math.round((infoHoy.segundosEnfoque / (75 * 60)) * 100), 100);
  document.getElementById('porcentajeEnfoqueCirculo').textContent = `${porcentaje}%`;

  // Renderizar lista de historial
  const contenedorLista = document.getElementById('contenedorListaSesiones');
  contenedorLista.innerHTML = '';

  if (infoHoy.historial.length === 0) {
    contenedorLista.innerHTML = `<span class="text-muted small text-center py-2">No hay sesiones completadas hoy</span>`;
  } else {
    infoHoy.historial.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'd-flex justify-content-between align-items-center p-2 bg-white rounded border-sm';
      div.style.fontSize = '0.75rem';
      div.innerHTML = `
        <div>
          <span class="fw-bold">${item.tipo === 'Enfoque' ? '🍅 Sesión ' + (index + 1) : '☕ Descanso'}</span>
          <span class="text-muted ms-2">${item.hora}</span>
        </div>
        <span class="badge bg-light text-dark border">${item.duracion}</span>
      `;
      contenedorLista.appendChild(div);
    });
  }
};

// Evento Abrir Modal
if (btnAbrirResumen) {
  btnAbrirResumen.addEventListener('click', () => {
    renderizarModalResumen();
    const modalElemento = document.getElementById('modalResumenPomodoro');
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalElemento);
    bsModal.show();
  });
}

  // Eventos de fecha y apertura de Modal
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

  // Render inicial
  renderizarTareas();
});
// ==========================================
// BASE DE DATOS MÚSICA & ENFOQUE
// ==========================================
const bibliotecaMusica = {
  clasica: {
    nombre: "Clásica",
    icono: "bi-bank",
    pistas: [
      { titulo: "Opera Night", artista: "Clásica Instrumental", duracion: "03:45", src: "audio/clasica/clasica 1.mp3" },
      { titulo: "Volare Sotto", artista: "Creators Audio Vault", duracion: "04:12", src: "audio/clasica/clasica 2.mp3" },
      { titulo: "Lyriclion Melody", artista: "Violín & Piano", duracion: "03:18", src: "audio/clasica/clasica 3.mp3" },
      { titulo: "Pushkinovo Violin", artista: "Violín Clásico", duracion: "02:55", src: "audio/clasica/clasica 4.mp3" }
    ]
  },
  jazz: {
    nombre: "Saxo Jazz",
    icono: "bi-music-note-list",
    pistas: [
      { titulo: "Jazz Restaurant 1", artista: "Alex Morgan", duracion: "03:30", src: "audio/jazz/jazz 1.mp3" },
      { titulo: "Jazz Restaurant 2", artista: "Alex Morgan", duracion: "03:15", src: "audio/jazz/jazz 2.mp3" },
      { titulo: "Jazz Lounge", artista: "Atlas Audio", duracion: "04:02", src: "audio/jazz/jazz 3.mp3" },
      { titulo: "Relaxing Jazz", artista: "Aurectheme", duracion: "03:48", src: "audio/jazz/jazz 4.mp3" },
      { titulo: "Jazz HipHop", artista: "The Mountain", duracion: "03:22", src: "audio/jazz/jazz 5.mp3" },
      { titulo: "Lofi Soul", artista: "Zephiramusic", duracion: "03:10", src: "audio/jazz/jazz 6.mp3" }
    ]
  },
  lofi: {
    nombre: "Lo-Fi",
    icono: "bi-music-note",
    pistas: [
      { titulo: "Midnight Club", artista: "Alex Morgan", duracion: "02:45", src: "audio/lofi/lofi 1.mp3" },
      { titulo: "Lofi Lounge", artista: "Zephiramusic", duracion: "03:05", src: "audio/lofi/lofi 2.mp3" },
      { titulo: "Lofi Reel", artista: "Zephiramusic", duracion: "02:50", src: "audio/lofi/lofi 3.mp3" }
    ]
  },
  nature: {
    nombre: "Naturaleza",
    icono: "bi-cloud-rain",
    pistas: [
      { titulo: "Agua Fluyente & Aves", artista: "Ambiente Natural", duracion: "04:20", src: "audio/nature/nature 1.mp3" },
      { titulo: "Bosque Matutino", artista: "Ambiente Natural", duracion: "03:50", src: "audio/nature/nature 2.mp3" },
      { titulo: "Aves del Bosque & Río", artista: "Ambiente Natural", duracion: "05:10", src: "audio/nature/nature 3.mp3" },
      { titulo: "Canto de Aves", artista: "Ambiente Natural", duracion: "02:40", src: "audio/nature/nature 4.mp3" },
      { titulo: "Lluvia & Truenos", artista: "Ambiente Natural", duracion: "06:00", src: "audio/nature/nature 5.mp3" }
    ]
  }
};

// ==========================================
// ESTADO GLOBAL Y ELEMENTOS DEL DOM
// ==========================================
let audio = document.getElementById("audioElemento");
if (!audio) {
  audio = new Audio();
  audio.id = "audioElemento";
  document.body.appendChild(audio);
}

let categoriaActual = "clasica";
let pistaActualIndex = 0;
let categoriaActivaModal = "clasica";

const btnPlayPause = document.getElementById("btnPlayPause");
const iconoPlay = document.getElementById("iconoPlay");
const barraProgreso = document.getElementById("barraProgreso");
const tiempoActualLbl = document.getElementById("tiempoActual");
const duracionTotalLbl = document.getElementById("duracionTotal");
const volumenInput = document.getElementById("volumenAmbiente");

// ==========================================
// LÓGICA DE REPRODUCCIÓN Y CONTROLES
// ==========================================

// 1. Reproducir Pista Seleccionada
function reproducirPista(catKey, index) {
  const categoria = bibliotecaMusica[catKey];
  if (!categoria || !categoria.pistas[index]) return;

  const pista = categoria.pistas[index];

  // Actualizar la interfaz
  const tituloPista = document.getElementById("tituloPista");
  const subtituloPista = document.getElementById("subtituloPista");
  const badgeCategoria = document.getElementById("badgeCategoria");

  if (tituloPista) tituloPista.textContent = pista.titulo;
  if (subtituloPista) subtituloPista.textContent = pista.artista;
  if (badgeCategoria) badgeCategoria.textContent = categoria.nombre.toUpperCase();

  // Asignar ruta y reproducir
  audio.src = pista.src;
  audio.load();

  audio.play().then(() => {
    if (iconoPlay) iconoPlay.className = "bi bi-pause-fill fs-3";
  }).catch(err => {
    console.warn("Autoplay bloqueado o ruta de audio no encontrada:", err);
    if (iconoPlay) iconoPlay.className = "bi bi-play-fill fs-3";
  });
}

// 2. Botón Play / Pausa Principal
if (btnPlayPause) {
  btnPlayPause.addEventListener("click", () => {
    if (!audio.src || audio.src === "" || audio.src.endsWith("/")) {
      reproducirPista(categoriaActual, pistaActualIndex);
      return;
    }

    if (audio.paused) {
      audio.play();
      if (iconoPlay) iconoPlay.className = "bi bi-pause-fill fs-3";
    } else {
      audio.pause();
      if (iconoPlay) iconoPlay.className = "bi bi-play-fill fs-3";
    }
  });
}

// 3. Botones de Categorías (Columna Izquierda)
document.querySelectorAll(".btn-categoria").forEach(boton => {
  boton.addEventListener("click", (e) => {
    const btnTarget = e.currentTarget;
    const nuevaCategoria = btnTarget.getAttribute("data-cat");

    if (!bibliotecaMusica[nuevaCategoria]) return;

    document.querySelectorAll(".btn-categoria").forEach(b => b.classList.remove("active"));
    btnTarget.classList.add("active");

    categoriaActual = nuevaCategoria;
    categoriaActivaModal = nuevaCategoria;
    pistaActualIndex = 0;

    reproducirPista(categoriaActual, pistaActualIndex);
  });
});

// 4. Botones Anterior y Siguiente
const btnAnterior = document.querySelector(".bi-skip-start-fill")?.parentElement;
const btnSiguiente = document.querySelector(".bi-skip-end-fill")?.parentElement;

if (btnSiguiente) {
  btnSiguiente.addEventListener("click", () => {
    const totalPistas = bibliotecaMusica[categoriaActual].pistas.length;
    pistaActualIndex = (pistaActualIndex + 1) % totalPistas;
    reproducirPista(categoriaActual, pistaActualIndex);
  });
}

if (btnAnterior) {
  btnAnterior.addEventListener("click", () => {
    const totalPistas = bibliotecaMusica[categoriaActual].pistas.length;
    pistaActualIndex = (pistaActualIndex - 1 + totalPistas) % totalPistas;
    reproducirPista(categoriaActual, pistaActualIndex);
  });
}

// 5. Barra de Progreso y Tiempos
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const porcentaje = (audio.currentTime / audio.duration) * 100;
    if (barraProgreso) barraProgreso.value = porcentaje;

    const minActual = Math.floor(audio.currentTime / 60);
    const secActual = Math.floor(audio.currentTime % 60);
    if (tiempoActualLbl) tiempoActualLbl.textContent = `${minActual < 10 ? '0' : ''}${minActual}:${secActual < 10 ? '0' : ''}${secActual}`;

    const minTotal = Math.floor(audio.duration / 60);
    const secTotal = Math.floor(audio.duration % 60);
    if (duracionTotalLbl) duracionTotalLbl.textContent = `${minTotal < 10 ? '0' : ''}${minTotal}:${secTotal < 10 ? '0' : ''}${secTotal}`;
  }
});

if (barraProgreso) {
  barraProgreso.addEventListener("input", () => {
    if (audio.duration) {
      audio.currentTime = (barraProgreso.value / 100) * audio.duration;
    }
  });
}

if (volumenInput) {
  volumenInput.addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });
}

// ==========================================
// MODAL DE LA BIBLIOTECA
// ==========================================
const btnAbrirBiblioteca = document.getElementById("btnAbrirBiblioteca");
if (btnAbrirBiblioteca) {
  btnAbrirBiblioteca.addEventListener("click", () => {
    renderizarModal();
    const modalElemento = document.getElementById("modalBiblioteca");
    if (modalElemento) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElemento);
      modal.show();
    }
  });
}

function renderizarModal() {
  const contenedorCategorias = document.getElementById("contenedorCategoriasModal");
  const contenedorPistas = document.getElementById("contenedorPistasModal");
  const lblCategoria = document.getElementById("nombreCategoriaSeleccionada");

  if (!contenedorCategorias || !contenedorPistas) return;

  lblCategoria.textContent = bibliotecaMusica[categoriaActivaModal].nombre;

  // Render Categorías
  contenedorCategorias.innerHTML = "";
  Object.keys(bibliotecaMusica).forEach(key => {
    const cat = bibliotecaMusica[key];
    const esActiva = key === categoriaActivaModal;

    const btnCat = document.createElement("button");
    btnCat.className = `btn d-flex justify-content-between align-items-center p-3 rounded-3 text-start border-0 ${esActiva ? 'bg-dark text-white' : 'bg-light text-dark'}`;
    btnCat.innerHTML = `
      <div>
        <i class="bi ${cat.icono} me-2"></i>
        <span class="fw-bold" style="font-size: 0.85rem;">${cat.nombre}</span>
      </div>
      <span class="badge ${esActiva ? 'bg-secondary' : 'bg-white text-dark'} rounded-pill" style="font-size: 0.7rem;">
        ${cat.pistas.length} pistas
      </span>
    `;

    btnCat.onclick = () => {
      categoriaActivaModal = key;
      renderizarModal();
    };

    contenedorCategorias.appendChild(btnCat);
  });

  // Render Canciones de la Categoría
  contenedorPistas.innerHTML = "";
  bibliotecaMusica[categoriaActivaModal].pistas.forEach((pista, index) => {
    const esMismaPista = (categoriaActivaModal === categoriaActual && index === pistaActualIndex);

    const itemPista = document.createElement("button");
    itemPista.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2 border-0 rounded-3 mb-1";
    itemPista.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <i class="bi ${esMismaPista && !audio.paused ? 'bi-bar-chart-fill text-success' : 'bi-music-note'}"></i>
        <div class="text-start">
          <p class="m-0 fw-bold" style="font-size: 0.8rem;">${pista.titulo}</p>
          <small class="text-muted" style="font-size: 0.7rem;">${pista.artista}</small>
        </div>
      </div>
      <span class="text-muted fw-bold" style="font-size: 0.75rem;">${pista.duracion}</span>
    `;

    itemPista.onclick = () => {
      categoriaActual = categoriaActivaModal;
      pistaActualIndex = index;

      document.querySelectorAll(".btn-categoria").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-cat") === categoriaActual);
      });

      reproducirPista(categoriaActual, pistaActualIndex);
      renderizarModal();
    };

    contenedorPistas.appendChild(itemPista);
  });
}



  const renderizarTareas = () => {
    
    
    
    actualizarOpcionesTareas();
  };