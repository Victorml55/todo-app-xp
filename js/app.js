// ESTADO Y PERSISTENCIA
let tasks = [];
let currentFilter = 'all';

function loadTasks() {
  try {
    const saved = localStorage.getItem('tasks');
    tasks = saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('Error al cargar tareas, iniciando lista vacía.');
    tasks = [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (e) {
    console.warn('Error al guardar tareas en localStorage.');
  }
}


// HU-01: AGREGAR TAREA

function addTask(text) {
  const trimmed = text.trim();

  if (trimmed === '') {
    showError('El campo no puede estar vacío.');
    return;
  }

  const newTask = {
    id: Date.now(),
    text: trimmed,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  clearInput();
}

function showError(message) {
  const input = document.getElementById('taskInput');
  input.classList.add('error');
  input.placeholder = message;
  setTimeout(() => {
    input.classList.remove('error');
    input.placeholder = 'Escribe una tarea...';
  }, 2000);
}

function clearInput() {
  document.getElementById('taskInput').value = '';
}


// RENDERIZADO

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  const filtered = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<li class="empty">No hay tareas aquí.</li>';
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="task-actions">
        <button class="btn-complete" onclick="toggleComplete(${task.id})">✓</button>
        <button class="btn-edit" onclick="editTask(${task.id})">✎</button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// HU-06: FILTROS

function setFilter(filter) {
  currentFilter = filter;

  // Actualizar botón activo
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });

  renderTasks();
}


// HU-02: MARCAR COMO COMPLETADA

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}


// HU-03: ELIMINAR TAREA

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}


// HU-04: EDITAR TAREA

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const li = document.querySelector(`[data-id="${id}"]`);
  const textSpan = li.querySelector('.task-text');

  // Convertir texto en input editable
  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.text;
  input.className = 'edit-input';
  textSpan.replaceWith(input);
  input.focus();

  // Cambiar botones
  const actions = li.querySelector('.task-actions');
  actions.innerHTML = `
    <button class="btn-save" onclick="saveEdit(${id}, this)">Guardar</button>
    <button class="btn-cancel" onclick="cancelEdit(${id}, '${task.text}')">Cancelar</button>
  `;

  // Confirmar con Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit(id, input);
    if (e.key === 'Escape') cancelEdit(id, task.text);
  });
}

function saveEdit(id, btn) {
  const li = document.querySelector(`[data-id="${id}"]`);
  const input = li.querySelector('.edit-input');
  const newText = input.value.trim();

  if (newText === '') {
    input.classList.add('error');
    input.placeholder = 'No puede estar vacío';
    setTimeout(() => input.classList.remove('error'), 2000);
    return;
  }

  const task = tasks.find(t => t.id === id);
  task.text = newText;
  saveTasks();
  renderTasks();
}

function cancelEdit(id, originalText) {
  renderTasks();
}


// EVENTOS

// Eventos de filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('taskInput');
  addTask(input.value);
});

document.getElementById('taskInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask(e.target.value);
  }
});


// INICIO

loadTasks();
renderTasks();