// Получение списка дел с API
const fetchTodos = async () => {
  try {
    const response = await fetch("https://dummyjson.com/todos");
    const todos = await response.json();
    return todos.todos;
  } catch (error) {
    console.error("Ошибка при загрузке дел:", error);
    return [];
  }
};

// Создание DOM элемента для одного дела
const createTodoElement = (todo) => {
  const element = document.createElement("div");
  element.className = "todo";
  element.id = `todo_${todo.id}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo__checkbox";
  checkbox.checked = Boolean(todo.completed);
  checkbox.name = "checkbox_" + todo.id;
  checkbox.id = "checkbox_" + todo.id;

  checkbox.addEventListener("change", (event) => {
    const label = document.getElementById("label_" + todo.id);
    label.classList.toggle("todo__label--done");
  });

  const label = document.createElement("label");
  label.id = "label_" + todo.id;
  label.htmlFor = checkbox.id;
  label.className = "todo__label";
  label.innerHTML = todo.todo;

  if (checkbox.checked) {
    label.classList.add("todo__label--done");
  }

  element.append(checkbox, label);
  return element;
};

// Рендеринг всех дел из API
const renderTodos = async () => {
  const todos = await fetchTodos();
  const container = document.getElementById("container");

  todos.forEach((todo) => {
    const element = createTodoElement(todo);
    container.insertBefore(element, container.firstChild);
  });
};

// Добавление одного нового дела в список
const renderSingleTodo = (todo) => {
  const container = document.getElementById("container");
  const element = createTodoElement(todo);
  container.insertBefore(element, container.querySelector(".form"));
};

// Создание нового дела через API
const writeNewTodo = async (todoText) => {
  try {
    const response = await fetch("https://dummyjson.com/todos/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: todoText,
        completed: false,
        userId: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const createdTodo = await response.json();
    renderSingleTodo(createdTodo);
  } catch (error) {
    console.error("Ошибка при добавлении дела:", error);
    alert("Не удалось добавить дело. Проверьте интернет-соединение.");
  }
};

// Обработчик отправки формы
document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.target.elements.input;
  const todoText = input.value.trim();

  if (todoText) {
    writeNewTodo(todoText);
    input.value = "";
  }
});

// Инициализация: загрузка дел при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  renderTodos();
});
