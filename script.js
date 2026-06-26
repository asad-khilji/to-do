const STORAGE_KEY = 'staticTodoTasks';
const STATUSES = ['All', 'To Do', 'In Progress', 'Waiting', 'Done'];
let tasks = [];
let activeStatus = 'All';
let editingTaskId = null;

const fallbackTasks = [
  { id: 1, title: 'Sample task', description: 'Add your first task or reset to load tasks.json.', category: 'General', priority: 'Medium', status: 'To Do', dueDate: '', createdAt: new Date().toISOString(), attachments: [] }
];

const els = {
  taskList: document.querySelector('#taskList'),
  statusNav: document.querySelector('#statusNav'),
  openAddForm: document.querySelector('#openAddForm'),
  taskDialog: document.querySelector('#taskDialog'),
  taskForm: document.querySelector('#taskForm'),
  formTitle: document.querySelector('#formTitle'),
  closeDialog: document.querySelector('#closeDialog'),
  searchInput: document.querySelector('#searchInput'),
  totalCount: document.querySelector('#totalCount'),
  urgentCount: document.querySelector('#urgentCount'),
  waitingCount: document.querySelector('#waitingCount'),
  doneCount: document.querySelector('#doneCount'),
  exportJson: document.querySelector('#exportJson'),
  resetData: document.querySelector('#resetData'),
  currentAttachments: document.querySelector('#currentAttachments')
};

async function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    tasks = JSON.parse(saved);
    render();
    return;
  }

  try {
    const response = await fetch('tasks.json');
    if (!response.ok) throw new Error('Could not load tasks.json');
    tasks = await response.json();
  } catch {
    tasks = fallbackTasks;
  }

  saveTasks();
  render();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks, null, 2));
}

function render() {
  renderStats();
  renderStatusButtons();
  renderTasks();
}

function renderStats() {
  els.totalCount.textContent = tasks.length;
  els.urgentCount.textContent = tasks.filter(task => task.priority === 'High' && task.status !== 'Done').length;
  els.waitingCount.textContent = tasks.filter(task => task.status === 'Waiting').length;
  els.doneCount.textContent = tasks.filter(task => task.status === 'Done').length;
}

function renderStatusButtons() {
  [...els.statusNav.querySelectorAll('button')].forEach(button => {
    button.classList.toggle('active', button.dataset.status === activeStatus);
  });
}

function renderTasks() {
  const search = els.searchInput.value.trim().toLowerCase();
  const filtered = tasks
    .filter(task => activeStatus === 'All' || task.status === activeStatus)
    .filter(task => [task.title, task.description, task.category, task.priority, task.status]
      .join(' ')
      .toLowerCase()
      .includes(search))
    .sort(sortTasks);

  if (!filtered.length) {
    els.taskList.innerHTML = '<div class="empty">No tasks found. Add your first task or change the filter.</div>';
    return;
  }

  els.taskList.innerHTML = filtered.map(task => `
    <article class="task-card priority-${escapeHtml(task.priority.toLowerCase())}">
      <div class="task-top">
        <span class="badge">${escapeHtml(task.category || 'General')}</span>
        <span class="status">${escapeHtml(task.status)}</span>
      </div>
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description || '').replaceAll('\n', '<br>')}</p>
      <div class="task-meta">
        <span>Priority: ${escapeHtml(task.priority)}</span>
        <span>Due: ${task.dueDate ? escapeHtml(task.dueDate) : 'No date'}</span>
      </div>
      ${renderAttachments(task.attachments)}
      <div class="actions">
        <button type="button" onclick="editTask(${task.id})">Edit</button>
        <button type="button" class="delete" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </article>
  `).join('');
}

function sortTasks(a, b) {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate && !b.dueDate) return -1;
  if (!a.dueDate && b.dueDate) return 1;
  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

function renderAttachments(attachments = []) {
  if (!attachments.length) return '';
  return `<div class="attachment-list">${attachments.map(file => `<span class="attachment-pill">${escapeHtml(file)}</span>`).join('')}</div>`;
}

function openForm(task = null) {
  editingTaskId = task?.id ?? null;
  els.formTitle.textContent = task ? 'Edit Task' : 'Add Task';
  document.querySelector('#taskId').value = task?.id ?? '';
  document.querySelector('#title').value = task?.title ?? '';
  document.querySelector('#description').value = task?.description ?? '';
  document.querySelector('#category').value = task?.category ?? 'General';
  document.querySelector('#priority').value = task?.priority ?? 'Medium';
  document.querySelector('#status').value = task?.status ?? 'To Do';
  document.querySelector('#dueDate').value = task?.dueDate ?? '';
  document.querySelector('#attachments').value = '';
  els.currentAttachments.innerHTML = renderAttachments(task?.attachments ?? []);
  els.taskDialog.showModal();
}

function handleSubmit(event) {
  event.preventDefault();

  const oldTask = tasks.find(task => task.id === editingTaskId);
  const oldStatus = oldTask?.status;
  const newStatus = document.querySelector('#status').value;
  const existingAttachments = oldTask?.attachments ?? [];
  const uploadedNames = [...document.querySelector('#attachments').files].map(file => file.name);

  const task = {
    id: editingTaskId ?? nextId(),
    title: document.querySelector('#title').value.trim(),
    description: document.querySelector('#description').value.trim(),
    category: document.querySelector('#category').value.trim() || 'General',
    priority: document.querySelector('#priority').value,
    status: newStatus,
    dueDate: document.querySelector('#dueDate').value,
    createdAt: oldTask?.createdAt ?? new Date().toISOString(),
    attachments: [...existingAttachments, ...uploadedNames]
  };

  if (editingTaskId) {
    tasks = tasks.map(item => item.id === editingTaskId ? task : item);
  } else {
    tasks.push(task);
  }

  saveTasks();
  els.taskDialog.close();
  render();

  if (editingTaskId && oldStatus !== newStatus) {
    openStatusEmail(task, oldStatus, newStatus);
  }
}

function openStatusEmail(task, oldStatus, newStatus) {
  const selected = [...document.querySelector('#notifyTo').selectedOptions].map(option => option.value);
  if (!selected.length) return;

  const subject = encodeURIComponent('Task Status Updated');
  const body = encodeURIComponent(`Task: ${task.title}\n\nStatus changed from:\n${oldStatus}\n\nTo:\n${newStatus}\n\nDescription:\n${task.description}`);
  window.location.href = `mailto:${selected.join(',')}?subject=${subject}&body=${body}`;
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (task) openForm(task);
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task || !confirm(`Delete "${task.title}"?`)) return;
  tasks = tasks.filter(item => item.id !== id);
  saveTasks();
  render();
}

function nextId() {
  return Math.max(0, ...tasks.map(task => Number(task.id) || 0)) + 1;
}

function exportJson() {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tasks-export.json';
  link.click();
  URL.revokeObjectURL(url);
}

async function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  await loadTasks();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

els.openAddForm.addEventListener('click', () => openForm());
els.closeDialog.addEventListener('click', () => els.taskDialog.close());
els.taskForm.addEventListener('submit', handleSubmit);
els.searchInput.addEventListener('input', renderTasks);
els.exportJson.addEventListener('click', exportJson);
els.resetData.addEventListener('click', resetData);
els.statusNav.addEventListener('click', event => {
  if (!event.target.matches('button')) return;
  activeStatus = event.target.dataset.status;
  render();
});

window.editTask = editTask;
window.deleteTask = deleteTask;

loadTasks();
