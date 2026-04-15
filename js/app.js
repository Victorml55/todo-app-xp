let tasks = [];

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  tasks = saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

loadTasks();