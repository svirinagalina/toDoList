// Состояние приложения
let currentFilter = 'all';
let searchQuery = '';
let allTodos = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadTodosFromStorage();
  updateDate();
  renderTodos();
  setupEventListeners();
  updateDateInterval();
});

// Установка обработчиков событий
function setupEventListeners() {
  const addTaskBtn = document.getElementById('addTaskBtn');
  const createForm = document.getElementById('create-form');
  const searchInput = document.getElementById('searchInput');
  const modal = document.getElementById('modal');

  addTaskBtn.addEventListener('click', openModal);
  createForm.addEventListener('submit', handleCreateTodo);
  searchInput.addEventListener('input', handleSearch);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// Управление модальным окном
function openModal() {
  const modal = document.getElementById('modal');
  const startDateInput = document.getElementById('startDate');

  modal.classList.add('active');

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  startDateInput.value = now.toISOString().slice(0, 16);

  startDateInput.focus();
}

function closeModal() {
  const modal = document.getElementById('modal');
  const form = document.getElementById('create-form');

  modal.classList.remove('active');
  form.reset();
}

// Управление задачами
function handleCreateTodo(e) {
  e.preventDefault();

  const description = document.getElementById('description').value.trim();
  const startDate = document.getElementById('startDate').value;
  const reminder = document.getElementById('reminder').checked;

  if (!description || !startDate) {
    alert('Пожалуйста, заполните все поля');
    return;
  }

  const newTodo = {
    id: 'todo_' + Math.random().toString(16).slice(2),
    description,
    startDate,
    createdAt: new Date().toISOString(),
    done: false,
    reminder,
  };

  allTodos.push(newTodo);
  saveTodosToStorage();
  renderTodos();
  closeModal();

  showNotification('Задача добавлена!');
}

function toggleTodoDone(todoId) {
  const todo = allTodos.find((t) => t.id === todoId);
  if (todo) {
    todo.done = !todo.done;
    saveTodosToStorage();
    renderTodos();

    if (todo.done) {
      showNotification('Задача завершена! ✓');
    }
  }
}

function deleteTodo(todoId) {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    allTodos = allTodos.filter((todo) => todo.id !== todoId);
    saveTodosToStorage();
    renderTodos();
    showNotification('Задача удалена');
  }
}

// Фильтрация и поиск
function filterTodos(filter) {
  currentFilter = filter;

  document.querySelectorAll('.split-button__button').forEach((btn) => {
    btn.classList.remove('split-button__button--active');
  });

  if (filter === 'all') {
    document.getElementById('filter-all').classList.add('split-button__button--active');
  } else if (filter === 'active') {
    document.getElementById('filter-active').classList.add('split-button__button--active');
  } else if (filter === 'done') {
    document.getElementById('filter-done').classList.add('split-button__button--active');
  }

  renderTodos();
}

function handleSearch(e) {
  searchQuery = e.target.value.toLowerCase().trim();
  renderTodos();
}

function getFilteredTodos() {
  let filtered = allTodos;

  if (currentFilter === 'active') {
    filtered = filtered.filter((todo) => !todo.done);
  } else if (currentFilter === 'done') {
    filtered = filtered.filter((todo) => todo.done);
  }

  if (searchQuery) {
    filtered = filtered.filter((todo) =>
      todo.description.toLowerCase().includes(searchQuery)
    );
  }

  return filtered;
}

// Рендеринг задач на экран
function renderTodos() {
  const container = document.getElementById('todo-list');
  const filteredTodos = getFilteredTodos();

  container.innerHTML = '';

  if (filteredTodos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📝</div>
        <p class="empty-state__text">
          ${searchQuery ? 'Задач не найдено' : 'Нет задач. Добавьте первую!'}
        </p>
      </div>
    `;
    return;
  }

  filteredTodos.forEach((todo) => {
    const startDate = new Date(todo.startDate);
    const formattedDate = startDate.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const todoElement = document.createElement('li');
    todoElement.className = 'todo-block';
    todoElement.innerHTML = `
      <label class="checkbox todo-block__checkbox">
        <input
          type="checkbox"
          ${todo.done ? 'checked' : ''}
          onchange="toggleTodoDone('${todo.id}')"
        />
        <span class="checkbox__check-icon"></span>
      </label>
      <div class="todo-block__data">
        <p class="todo-block__date">${formattedDate}</p>
        <h3 class="todo-block__title">${escapeHtml(todo.description)}</h3>
        ${todo.reminder ? '<p class="todo-block__reminder">🔔 Напоминание включено</p>' : ''}
      </div>
      <button
        class="todo-block__delete material-symbols-rounded"
        onclick="deleteTodo('${todo.id}')"
        title="Удалить задачу"
      >
        close
      </button>
    `;

    container.appendChild(todoElement);
  });
}

// Дата и время
function updateDate() {
  const now = new Date();

  const dayName = now.toLocaleString('ru-RU', { weekday: 'long' });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  const date = now.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });

  document.getElementById('dayName').textContent = capitalizedDay;
  document.getElementById('dateToday').textContent = date;
}

function updateDateInterval() {
  setInterval(() => {
    const now = new Date();
    const lastUpdate = localStorage.getItem('lastDateUpdate');
    const today = now.toDateString();

    if (lastUpdate !== today) {
      updateDate();
      localStorage.setItem('lastDateUpdate', today);
    }
  }, 3600000); // 1 час
}

// Хранилище данных
function saveTodosToStorage() {
  localStorage.setItem('todosStorage', JSON.stringify(allTodos));
}

function loadTodosFromStorage() {
  const stored = localStorage.getItem('todosStorage');
  allTodos = stored ? JSON.parse(stored) : [];
}

// Уведомления
function showNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Todo List', {
      body: message,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%236750a4" width="100" height="100"/><text x="50" y="70" font-size="60" text-anchor="middle" fill="white">✓</text></svg>',
    });
  }

  console.log('📋 ' + message);
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

requestNotificationPermission();

// Утилиты
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Экспорт задач
function exportTodos() {
  const dataStr = JSON.stringify(allTodos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Очистка всех задач
function clearAllTodos() {
  if (confirm('Вы уверены? Это удалит все задачи! Это действие нельзя отменить.')) {
    allTodos = [];
    saveTodosToStorage();
    renderTodos();
    showNotification('Все задачи удалены');
  }
}

// Проверка просроченных задач
function checkOverdueTodos() {
  const now = new Date();
  allTodos.forEach((todo) => {
    if (!todo.done && todo.reminder) {
      const todoDate = new Date(todo.startDate);
      if (todoDate <= now && todoDate > new Date(now.getTime() - 3600000)) {
        showNotification(`⏰ Напоминание: ${todo.description}`);
      }
    }
  });
}

setInterval(checkOverdueTodos, 300000); // каждые 5 минут
