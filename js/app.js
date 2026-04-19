// ==========================================
// ESTADO
// ==========================================
let tasks = [];
let availableTags = ['general'];
let currentStatusFilter = 'all';
let currentTagFilter = null;
let currentSearch = '';
let editingTaskId = null;
let deletingTaskId = null;

let newTaskSelectedTags = ['general'];

// ==========================================
// PERSISTENCIA
// ==========================================
function loadData() {
  try {
    const savedTasks = localStorage.getItem('tasks');
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
    tasks.forEach(task => {
      if (!task.tags) task.tags = ['general'];
      if (!task.description) task.description = '';
      if (!task.createdAt) task.createdAt = null;
      if (!task.dueDate) task.dueDate = null;
    });
  } catch (e) {
    tasks = [];
  }

  try {
    const savedTags = localStorage.getItem('availableTags');
    availableTags = savedTags ? JSON.parse(savedTags) : ['general'];
    if (!availableTags.includes('general')) availableTags.unshift('general');
  } catch (e) {
    availableTags = ['general'];
  }
}

function saveData() {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('availableTags', JSON.stringify(availableTags));
  } catch (e) {
    console.warn('Error al guardar datos.');
  }
}

// ==========================================
// AGREGAR TAREA
// ==========================================
function addTask() {
  const titleInput   = document.getElementById('taskTitle');
  const descInput    = document.getElementById('taskDesc');
  const dueDateInput = document.getElementById('taskDueDate');
  const title   = titleInput.value.trim();
  const desc    = descInput.value.trim();
  const dueDate = dueDateInput.value || null;

  if (!title) {
    titleInput.classList.add('error');
    titleInput.placeholder = 'El título no puede estar vacío';
    setTimeout(() => {
      titleInput.classList.remove('error');
      titleInput.placeholder = 'Nombre de la tarea...';
    }, 2000);
    return;
  }

  const selectedTags = newTaskSelectedTags.length > 0 ? [...newTaskSelectedTags] : ['general'];

  tasks.push({
    id: Date.now(),
    title,
    description: desc,
    completed: false,
    tags: selectedTags,
    createdAt: new Date().toISOString(),
    dueDate: dueDate
  });

  saveData();
  titleInput.value    = '';
  descInput.value     = '';
  dueDateInput.value  = '';
  newTaskSelectedTags = ['general'];
  renderNewTaskTagSelector();
  renderTable();
}

// ==========================================
// ELIMINAR TAREA (con confirmación)
// ==========================================
function deleteTask(id) {
  deletingTaskId = id;
  document.getElementById('confirmModal').style.display = 'flex';
}

function confirmDelete() {
  if (deletingTaskId === null) return;
  tasks = tasks.filter(t => t.id !== deletingTaskId);
  saveData();
  renderTable();
  closeConfirmModal();
}

function closeConfirmModal() {
  deletingTaskId = null;
  document.getElementById('confirmModal').style.display = 'none';
}

// ==========================================
// TOGGLE COMPLETADO
// ==========================================
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveData();
  renderTable();
}

// ==========================================
// MODAL DE EDICIÓN
// ==========================================
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  document.getElementById('editTitle').value   = task.title || '';
  document.getElementById('editDesc').value    = task.description || '';
  document.getElementById('editDueDate').value = task.dueDate || '';
  renderEditTagSelector(task.tags || ['general']);
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  editingTaskId = null;
  document.getElementById('editModal').style.display = 'none';
}

function saveEditModal() {
  if (!editingTaskId) return;
  const task = tasks.find(t => t.id === editingTaskId);
  if (!task) return;

  const titleInput = document.getElementById('editTitle');
  const newTitle   = titleInput.value.trim();

  if (!newTitle) {
    titleInput.classList.add('error');
    setTimeout(() => titleInput.classList.remove('error'), 2000);
    return;
  }

  task.title       = newTitle;
  task.description = document.getElementById('editDesc').value.trim();
  task.dueDate     = document.getElementById('editDueDate').value || null;

  const selectedChips = document.querySelectorAll('#editTagSelector .tag-chip-check.selected');
  const selectedTags  = Array.from(selectedChips).map(c => c.dataset.tag);
  task.tags = selectedTags.length > 0 ? selectedTags : ['general'];

  saveData();
  closeEditModal();
  renderTable();
}

function handleOverlayClick(e) {
  if (e.target.id === 'editModal') closeEditModal();
}

// ==========================================
// TAGS – CREAR Y ELIMINAR
// ==========================================
function createTag() {
  const input = document.getElementById('newTagInput');
  const name  = input.value.trim().toLowerCase().replace(/\s+/g, '-');

  if (!name) return;
  if (availableTags.includes(name)) {
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 1500);
    return;
  }

  availableTags.push(name);
  saveData();
  input.value = '';
  renderTagsManagement();
  renderNewTaskTagSelector();
  renderTagFilters();
}

function deleteTag(tagName) {
  if (tagName === 'general') return;

  availableTags = availableTags.filter(t => t !== tagName);
  tasks.forEach(task => {
    task.tags = task.tags.filter(t => t !== tagName);
    if (task.tags.length === 0) task.tags = ['general'];
  });

  if (currentTagFilter === tagName) currentTagFilter = null;

  saveData();
  renderTagsManagement();
  renderNewTaskTagSelector();
  renderTagFilters();
  renderTable();
}

// ==========================================
// RENDERIZADO – SELECTOR DE TAGS (formulario)
// ==========================================
function renderNewTaskTagSelector() {
  const container = document.getElementById('newTaskTagSelector');
  container.innerHTML = '';

  availableTags.forEach(tag => {
    const chip = buildTagChip(tag, newTaskSelectedTags.includes(tag), (selected, t) => {
      if (selected) {
        if (!newTaskSelectedTags.includes(t)) newTaskSelectedTags.push(t);
      } else {
        newTaskSelectedTags = newTaskSelectedTags.filter(x => x !== t);
        if (newTaskSelectedTags.length === 0) newTaskSelectedTags = ['general'];
      }
      renderNewTaskTagSelector();
    });
    container.appendChild(chip);
  });
}

function renderEditTagSelector(currentTags) {
  const container = document.getElementById('editTagSelector');
  container.innerHTML = '';
  let editSelected = [...currentTags];

  availableTags.forEach(tag => {
    const chip = buildTagChip(tag, editSelected.includes(tag), (selected, t) => {
      if (selected) {
        if (!editSelected.includes(t)) editSelected.push(t);
      } else {
        editSelected = editSelected.filter(x => x !== t);
        if (editSelected.length === 0) editSelected = ['general'];
      }
      container.querySelectorAll('.tag-chip-check').forEach(c => {
        c.classList.toggle('selected', editSelected.includes(c.dataset.tag));
      });
    });
    container.appendChild(chip);
  });
}

function buildTagChip(tag, isSelected, onChange) {
  const chip = document.createElement('span');
  chip.className = `tag-chip-check${isSelected ? ' selected' : ''}`;
  chip.dataset.tag = tag;
  chip.textContent = tag;
  chip.addEventListener('click', () => {
    const nowSelected = !chip.classList.contains('selected');
    onChange(nowSelected, tag);
  });
  return chip;
}

// ==========================================
// RENDERIZADO – GESTIÓN DE TAGS
// ==========================================
function renderTagsManagement() {
  const container = document.getElementById('tagListManage');
  container.innerHTML = '';

  availableTags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = `tag-manage-chip${tag === 'general' ? ' is-general' : ''}`;

    const label = document.createElement('span');
    label.textContent = tag;
    chip.appendChild(label);

    if (tag !== 'general') {
      const del = document.createElement('button');
      del.className = 'delete-tag';
      del.title = `Eliminar etiqueta "${tag}"`;
      del.textContent = '✕';
      del.addEventListener('click', () => deleteTag(tag));
      chip.appendChild(del);
    }

    container.appendChild(chip);
  });
}

// ==========================================
// RENDERIZADO – FILTROS DE TAGS
// ==========================================
function renderTagFilters() {
  const container = document.getElementById('tagFilters');
  container.innerHTML = '';

  availableTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = `tag-filter-btn${currentTagFilter === tag ? ' active' : ''}`;
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      currentTagFilter = (currentTagFilter === tag) ? null : tag;
      renderTagFilters();
      renderTable();
    });
    container.appendChild(btn);
  });
}

// ==========================================
// FILTROS DE ESTADO
// ==========================================
function setStatusFilter(filter) {
  currentStatusFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTable();
}

// ==========================================
// UTILIDAD – FORMATEO DE FECHA
// ==========================================
function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDueDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return '—';
  return `${d}/${m}/${y}`;
}

// ==========================================
// RENDERIZADO – TABLA
// ==========================================
function renderTable() {
  const tbody     = document.getElementById('taskTableBody');
  const emptyDiv  = document.getElementById('emptyState');
  const tableWrap = document.querySelector('.table-wrap');
  tbody.innerHTML = '';

  const search = currentSearch.toLowerCase();

  const filtered = tasks.filter(task => {
    if (currentStatusFilter === 'pending'   && task.completed)  return false;
    if (currentStatusFilter === 'completed' && !task.completed) return false;
    if (currentTagFilter && !task.tags.includes(currentTagFilter)) return false;
    if (search) {
      const inTitle = (task.title || '').toLowerCase().includes(search);
      const inDesc  = (task.description || '').toLowerCase().includes(search);
      const inTags  = task.tags.some(t => t.toLowerCase().includes(search));
      if (!inTitle && !inDesc && !inTags) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tableWrap.style.display = 'none';
    emptyDiv.style.display  = 'block';
    return;
  }

  tableWrap.style.display = 'block';
  emptyDiv.style.display  = 'none';

  filtered.forEach(task => {
    const tr = document.createElement('tr');
    if (task.completed) tr.classList.add('is-completed');

    // Título + tags
    const tdTitle = document.createElement('td');
    const titleDiv = document.createElement('div');
    titleDiv.className = `cell-title${task.completed ? ' done-text' : ''}`;
    titleDiv.textContent = task.title || '(sin título)';
    tdTitle.appendChild(titleDiv);
    if (task.tags && task.tags.length > 0) {
      const tagRow = document.createElement('div');
      tagRow.className = 'cell-tags';
      task.tags.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'inline-tag';
        tag.textContent = t;
        tagRow.appendChild(tag);
      });
      tdTitle.appendChild(tagRow);
    }

    // Descripción
    const tdDesc = document.createElement('td');
    tdDesc.className = 'cell-desc';
    tdDesc.textContent = task.description || '—';

    // Fecha creación
    const tdCreated = document.createElement('td');
    tdCreated.className = 'cell-date';
    tdCreated.textContent = formatDate(task.createdAt);

    // Fecha límite
    const tdDue = document.createElement('td');
    tdDue.className = 'cell-date';
    tdDue.textContent = formatDueDate(task.dueDate);

    // Completado
    const tdDone = document.createElement('td');
    tdDone.className = 'cell-done';
    const toggleBtn = document.createElement('button');
    toggleBtn.className = `complete-toggle${task.completed ? ' checked' : ''}`;
    toggleBtn.title = task.completed ? 'Marcar como pendiente' : 'Marcar como completada';
    toggleBtn.textContent = '✓';
    toggleBtn.addEventListener('click', () => toggleComplete(task.id));
    tdDone.appendChild(toggleBtn);

    // Acciones
    const tdActions = document.createElement('td');
    tdActions.className = 'cell-actions';
    const actWrap = document.createElement('div');
    actWrap.className = 'actions-wrap';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = '✎ Editar';
    editBtn.addEventListener('click', () => openEditModal(task.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.textContent = '✕ Eliminar';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actWrap.appendChild(editBtn);
    actWrap.appendChild(delBtn);
    tdActions.appendChild(actWrap);

    tr.appendChild(tdTitle);
    tr.appendChild(tdDesc);
    tr.appendChild(tdCreated);
    tr.appendChild(tdDue);
    tr.appendChild(tdDone);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

// ==========================================
// TEMA
// ==========================================
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
}

function loadTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeBtn').textContent = '☀️';
  }
}

// ==========================================
// EVENTOS
// ==========================================
document.getElementById('addBtn').addEventListener('click', addTask);

document.getElementById('taskTitle').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
document.getElementById('taskDesc').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

document.getElementById('createTagBtn').addEventListener('click', createTag);
document.getElementById('newTagInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') createTag();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => setStatusFilter(btn.dataset.filter));
});

document.getElementById('searchInput').addEventListener('input', e => {
  currentSearch = e.target.value;
  renderTable();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeEditModal();
    closeConfirmModal();
  }
});

// ==========================================
// INICIO
// ==========================================
loadTheme();
loadData();
renderTagsManagement();
renderNewTaskTagSelector();
renderTagFilters();
renderTable();
