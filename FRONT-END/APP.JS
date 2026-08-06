document.addEventListener('DOMContentLoaded', () => {
  let tareas = JSON.parse(localStorage.getItem('tareas_sereno')) || [];
  let categoriaSeleccionada = 'Trabajo';
  let energiaSeleccionada = 'Fácil';

  // Referencias a elementos del DOM
  const campoTareaRapida = document.getElementById('campoTareaRapida');
  const botonAbrirModal = document.getElementById('botonAbrirModal');
  const modalElemento = new bootstrap.Modal(document.getElementById('modalAgregarTarea'));
  const formularioModalTarea = document.getElementById('formularioModalTarea');
  const modalInputTitulo = document.getElementById('modalInputTitulo');
  const modalInputFecha = document.getElementById('modalInputFecha');
  const cuerpoTablaTareas = document.getElementById('cuerpoTablaTareas');

  // Asignar fecha de hoy por defecto en el selector
  const hoy = new Date().toISOString().split('T')[0];
  if (modalInputFecha) modalInputFecha.value = hoy;

  // 1. Abrir modal al presionar el sello o botón "Agregar"
  if (botonAbrirModal) {
    botonAbrirModal.addEventListener('click', () => {
      if (campoTareaRapida && campoTareaRapida.value.trim() !== '') {
        modalInputTitulo.value = campoTareaRapida.value.trim();
      }
      modalElemento.show();
    });
  }

  // 2. Configuración de interacción para Categorías (Tarjetas cuadradas)
  const contenedorCategorias = document.getElementById('opcionesCategoria');
  if (contenedorCategorias) {
    contenedorCategorias.addEventListener('click', (e) => {
      const tarjeta = e.target.closest('.tarjeta-categoria');
      if (!tarjeta) return;

      // Quitar clase activo de todas las tarjetas y ponerla en la seleccionada
      contenedorCategorias.querySelectorAll('.tarjeta-categoria').forEach(el => el.classList.remove('activo'));
      tarjeta.classList.add('activo');
      categoriaSeleccionada = tarjeta.dataset.valor;
    });
  }

  // 3. Configuración de interacción para Nivel de Energía
  const contenedorEnergia = document.getElementById('opcionesEnergia');
  if (contenedorEnergia) {
    contenedorEnergia.addEventListener('click', (e) => {
      const boton = e.target.closest('.boton-energia');
      if (!boton) return;

      // Quitar clase activo de todos los botones y ponerla en el seleccionado
      contenedorEnergia.querySelectorAll('.boton-energia').forEach(el => el.classList.remove('activo'));
      boton.classList.add('activo');
      energiaSeleccionada = boton.dataset.valor;
    });
  }

  // 4. Guardar tarea al presionar "AGREGAR TAREA" en el modal
  if (formularioModalTarea) {
    formularioModalTarea.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nuevaTarea = {
        id: Date.now(),
        titulo: modalInputTitulo.value.trim(),
        categoria: categoriaSeleccionada,
        fecha: modalInputFecha.value,
        energia: energiaSeleccionada,
        completada: false
      };

      tareas.push(nuevaTarea);
      guardarYRenderizar();

      // Limpiar campos y cerrar modal
      modalInputTitulo.value = '';
      if (campoTareaRapida) campoTareaRapida.value = '';
      modalElemento.hide();
    });
  }

  // 5. Renderizar lista en la tabla
  function renderizar() {
    if (!cuerpoTablaTareas) return;
    cuerpoTablaTareas.innerHTML = '';

    if (tareas.length === 0) {
      cuerpoTablaTareas.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">No hay tareas registradas</td>
        </tr>`;
      return;
    }

    tareas.forEach(tarea => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="checkbox" class="form-check-input" ${tarea.completada ? 'checked' : ''} onclick="alternarTarea(${tarea.id})">
        </td>
        <td class="${tarea.completada ? 'text-decoration-line-through text-muted' : 'fw-semibold'}">${tarea.titulo}</td>
        <td class="small text-muted">${formatearFecha(tarea.fecha)}</td>
        <td>${obtenerIconoEnergia(tarea.energia)}</td>
        <td class="text-end">
          <button class="btn btn-sm text-danger" onclick="eliminarTarea(${tarea.id})"><i class="bi bi-trash"></i></button>
        </td>
      `;
      cuerpoTablaTareas.appendChild(tr);
    });
  }

  function formatearFecha(fechaTexto) {
    if (!fechaTexto) return 'Hoy';
    const partes = fechaTexto.split('-');
    return `${partes[2]}/${partes[1]}`;
  }

  function obtenerIconoEnergia(energia) {
    if (energia === 'Alta') return '<span class="text-danger"><i class="bi bi-lightning-fill"></i><i class="bi bi-lightning-fill"></i><i class="bi bi-lightning-fill"></i></span>';
    if (energia === 'Media') return '<span class="text-warning"><i class="bi bi-lightning-fill"></i><i class="bi bi-lightning-fill"></i></span>';
    return '<span class="text-success"><i class="bi bi-lightning-fill"></i></span>';
  }

  window.alternarTarea = (id) => {
    tareas = tareas.map(t => t.id === id ? { ...t, completada: !t.completada } : t);
    guardarYRenderizar();
  };

  window.eliminarTarea = (id) => {
    tareas = tareas.filter(t => t.id !== id);
    guardarYRenderizar();
  };

  function guardarYRenderizar() {
    localStorage.setItem('tareas_sereno', JSON.stringify(tareas));
    renderizar();
  }

  renderizar();
});