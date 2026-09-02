class TaskManager {
  constructor(currentId = 0) {
    this.tasks = JSON.parse(localStorage.getItem('tareas_db')) || [];
    // Si ya existen tareas, aseguramos que currentId tome el valor más alto existente
    const maxId = this.tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0);
    this.currentId = maxId > 0 ? maxId : currentId;
  }

  save() {
    localStorage.setItem('tareas_db', JSON.stringify(this.tasks));
  }

  // Tarea 5: Registrar tareas
  addTask(name, description, dueDate, status = 'PORHACER') {
    this.currentId++;
    const newTask = {
      id: this.currentId,
      name: name,
      description: description,
      dueDate: dueDate,
      status: status,
      completada: false
    };

    this.tasks.push(newTask);
    this.save();
    return newTask;
  }

  // Tarea 6: Eliminar tarea por ID
  deleteTask(taskId) {
    const newTasks = [];
    for (let task of this.tasks) {
      if (task.id !== Number(taskId)) {
        newTasks.push(task);
      }
    }
    this.tasks = newTasks;
    this.save();
  }

  // Tarea 4 (Parte 2): Conmutar el estado de completada
  toggleTaskStatus(taskId) {
    this.tasks = this.tasks.map(task => {
      if (task.id === Number(taskId)) {
        return { ...task, completada: !task.completada };
      }
      return task;
    });
    this.save();
  }
}