// ESTADO Y PERSISTENCIA
let tasks = [];
let currentFilter = 'all';

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
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
        <button class="btn-delete" onclick="deleteTask(${task.id})">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Funciones placeholder para las siguientes HU
function toggleComplete(id) { console.log('HU-02 pendiente', id); }
function deleteTask(id) { console.log('HU-03 pendiente', id); }


// EVENTOS

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