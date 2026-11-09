(() => {
  "use strict";

  const STORAGE_KEY = "taskflow-todos-v1";
  const form = document.querySelector("#task-form");
  const taskInput = document.querySelector("#task-input");
  const taskList = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const emptyTitle = document.querySelector("#empty-title");
  const emptyMessage = document.querySelector("#empty-message");
  const summary = document.querySelector("#task-summary");
  const clearCompletedButton = document.querySelector("#clear-completed");
  const filters = document.querySelector(".filters");
  const editDialog = document.querySelector("#edit-dialog");
  const editForm = document.querySelector("#edit-form");
  const editInput = document.querySelector("#edit-input");

  let tasks = loadTasks();
  let currentFilter = "all";
  let editingTaskId = null;

  document.querySelector("#today-label").textContent =
    new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());

  function loadTasks() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(stored)
        ? stored.filter(task => task && typeof task.id === "string" &&
            typeof task.text === "string" && typeof task.completed === "boolean")
        : [];
    } catch (error) {
      console.warn("Could not read saved tasks:", error);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks:", error);
      summary.textContent = "Storage is unavailable — your changes may not persist.";
    }
  }

  function visibleTasks() {
    if (currentFilter === "active") return tasks.filter(task => !task.completed);
    if (currentFilter === "completed") return tasks.filter(task => task.completed);
    return tasks;
  }

  function render() {
    const activeCount = tasks.filter(task => !task.completed).length;
    const completedCount = tasks.length - activeCount;
    document.querySelector("#all-count").textContent = tasks.length;
    document.querySelector("#active-count").textContent = activeCount;
    document.querySelector("#completed-count").textContent = completedCount;
    summary.textContent = tasks.length
      ? `${activeCount} active · ${completedCount} completed`
      : "No tasks yet";

    taskList.replaceChildren();
    const shown = visibleTasks();
    shown.forEach(task => {
      const item = document.createElement("li");
      item.className = `task-item${task.completed ? " completed" : ""}`;
      item.dataset.id = task.id;

      const checkbox = document.createElement("input");
      checkbox.className = "task-check";
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Mark "${task.text}" ${task.completed ? "active" : "completed"}`);
      checkbox.dataset.action = "toggle";

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editButton = document.createElement("button");
      editButton.className = "icon-button";
      editButton.type = "button";
      editButton.dataset.action = "edit";
      editButton.setAttribute("aria-label", `Edit "${task.text}"`);
      editButton.title = "Edit task";
      editButton.textContent = "✎";

      const deleteButton = document.createElement("button");
      deleteButton.className = "icon-button delete";
      deleteButton.type = "button";
      deleteButton.dataset.action = "delete";
      deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
      deleteButton.title = "Delete task";
      deleteButton.textContent = "×";

      actions.append(editButton, deleteButton);
      item.append(checkbox, text, actions);
      taskList.append(item);
    });

    const isEmpty = shown.length === 0;
    emptyState.hidden = !isEmpty;
    if (isEmpty) {
      const messages = {
        all: ["A fresh start", "Add your first task above and make it happen."],
        active: ["All caught up", "There are no active tasks right now."],
        completed: ["Nothing completed yet", "Finish a task and it will show up here."]
      };
      [emptyTitle.textContent, emptyMessage.textContent] = messages[currentFilter];
    }

    filters.querySelectorAll("[data-filter]").forEach(button => {
      const selected = button.dataset.filter === currentFilter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    clearCompletedButton.disabled = completedCount === 0;
    clearCompletedButton.style.opacity = completedCount === 0 ? ".45" : "1";
  }

  function addTask(text) {
    const cleanText = text.trim();
    if (!cleanText) return;
    tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, text: cleanText, completed: false });
    saveTasks();
    currentFilter = "all";
    render();
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    addTask(taskInput.value);
    taskInput.value = "";
    taskInput.focus();
  });

  // One delegated listener handles toggle, edit, and delete for every task row.
  taskList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = button.closest(".task-item");
    if (!item) return;
    const task = tasks.find(entry => entry.id === item.dataset.id);
    if (!task) return;

    if (button.dataset.action === "edit") {
      editingTaskId = task.id;
      editInput.value = task.text;
      editDialog.showModal();
      editInput.focus();
      editInput.select();
    } else if (button.dataset.action === "delete") {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      render();
    }
  });

  // Delegated change event for dynamically rendered checkboxes.
  taskList.addEventListener("change", event => {
    if (!event.target.matches('input[data-action="toggle"]')) return;
    const item = event.target.closest(".task-item");
    const task = tasks.find(entry => entry.id === item?.dataset.id);
    if (!task) return;
    task.completed = event.target.checked;
    saveTasks();
    render();
  });

  filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    currentFilter = button.dataset.filter;
    render();
  });

  editForm.addEventListener("submit", event => {
    event.preventDefault();
    const cleanText = editInput.value.trim();
    if (!cleanText || !editingTaskId) return;
    const task = tasks.find(entry => entry.id === editingTaskId);
    if (task) {
      task.text = cleanText;
      saveTasks();
    }
    editingTaskId = null;
    editDialog.close();
    render();
  });

  document.querySelector("#cancel-edit").addEventListener("click", () => {
    editingTaskId = null;
    editDialog.close();
  });

  editDialog.addEventListener("close", () => { editingTaskId = null; });

  clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    render();
  });

  render();
})();
