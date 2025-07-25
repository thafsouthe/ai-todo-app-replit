
const taskInput = document.getElementById('ta');
const addTaskBtn = document.getElementById('add-task');
const taskBoard = document.getElementById('task-board');
const clearCompletedBtn = document.getElementById('clear-completed');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Ensure all tasks have IDs (for backward compatibility)
tasks = tasks.map((task, index) => {
  if (!task.id) {
    task.id = Date.now() + index;
  }
  return task;
});

// Save the updated tasks with IDs
if (tasks.length > 0) {
  saveTasks();
}
let currentFilter = 'all';
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize dark mode
function initDarkMode() {
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    darkModeToggle.textContent = '🌙';
  }
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  initDarkMode();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskBoard.innerHTML = '';
  const filteredTasks = getFilteredTasks();
  
  filteredTasks.forEach((task, index) => {
    const card = document.createElement('div');
    card.className = 'task' + (task.completed ? ' completed' : '');
    card.setAttribute('data-task-id', task.id.toString());

    const text = document.createElement('span');
    text.textContent = task.text;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = task.completed ? 'Undo' : 'Done';
    doneBtn.className = 'done-btn';
    doneBtn.onclick = (e) => {
      e.stopPropagation();
      toggleComplete(task.id);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    };

    // Add keyboard support for task cards
    card.tabIndex = 0;
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteTask(task.id);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleComplete(task.id);
      }
    });

    btnGroup.appendChild(doneBtn);
    btnGroup.appendChild(deleteBtn);

    card.appendChild(text);
    card.appendChild(btnGroup);
    taskBoard.appendChild(card);
  });
}

function getFilteredTasks() {
  return tasks.filter(task => {
    switch (currentFilter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false
  };
  
  tasks.push(newTask);
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function toggleComplete(taskId) {
  const task = tasks.find(task => task.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  
  // Update active filter button
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });
  
  renderTasks();
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
clearCompletedBtn.addEventListener('click', clearCompleted);
darkModeToggle.addEventListener('click', toggleDarkMode);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

// Keyboard shortcuts
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to add task
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    taskInput.focus();
  }
  
  // Escape to clear input
  if (e.key === 'Escape' && document.activeElement === taskInput) {
    taskInput.value = '';
    taskInput.blur();
  }
  
  // Number keys for filters (1, 2, 3)
  if (!taskInput.matches(':focus')) {
    switch (e.key) {
      case '1':
        setFilter('all');
        break;
      case '2':
        setFilter('active');
        break;
      case '3':
        setFilter('completed');
        break;
    }
  }
});

// Initialize app
window.addEventListener('load', () => {
  initDarkMode();
  renderTasks();
});
