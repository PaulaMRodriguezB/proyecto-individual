class TaskManager {
  constructor(currentId = 0) {
    this.tasks = [];
    this.currentId = currentId;
  }

  // Tarea 8: Método save()
  save() {
    const tasksJson = JSON.stringify(this.tasks);
    localStorage.setItem('tasks', tasksJson);

    const currentId = String(this.currentId);
    localStorage.setItem('currentId', currentId);
  }

  // Tarea 8: Método load()
  load() {
    const tasksJson = localStorage.getItem('tasks');
    if (tasksJson) {
      try {
        this.tasks = JSON.parse(tasksJson) || [];
      } catch (e) {
        this.tasks = [];
      }
    }

    const currentId = localStorage.getItem('currentId');
    if (currentId) {
      this.currentId = Number(currentId);
    } else if (this.tasks.length > 0) {
      const maxId = this.tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0);
      this.currentId = maxId;
    }
  }

  // Tarea 7: Método getTaskById()
  getTaskById(taskId) {
    let foundTask;
    for (let task of this.tasks) {
      if (task.id === Number(taskId)) {
        foundTask = task;
      }
    }
    return foundTask;
  }

  // Tarea 5: Agregar tarea
  addTask(name, description, dueDate, status = 'PORHACER') {
    this.currentId++;
    const newTask = {
      id: this.currentId,
      name: name,
      description: description,
      dueDate: dueDate,
      status: status,
      completada: status === 'DONE'
    };

    this.tasks.push(newTask);
    this.save();
    return newTask;
  }

  // Tarea 6: Eliminar tarea
  deleteTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== Number(taskId));
    this.save();
  }

  // Tarea 7 & 8: Cambiar estado
  toggleTaskStatus(taskId) {
    const task = this.getTaskById(taskId);
    if (task) {
      task.completada = !task.completada;
      task.status = task.completada ? 'DONE' : 'PORHACER';
      this.save();
    }
  }
}