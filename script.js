document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const pendingTasksCount = document.getElementById('pending-tasks');
    const clearAllBtn = document.getElementById('clear-all');

    // Retrieve tasks from Local Storage or initialize empty array
    let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];

    // Save tasks to Local Storage
    const saveTasks = () => {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    };

    // Update pending tasks count and Clear All button state
    const updateStats = () => {
        const pendingCount = tasks.filter(task => !task.completed).length;
        pendingTasksCount.textContent = `${pendingCount} task${pendingCount !== 1 ? 's' : ''} pending`;
        
        if (tasks.length === 0) {
            clearAllBtn.style.opacity = '0.3';
            clearAllBtn.style.pointerEvents = 'none';
        } else {
            clearAllBtn.style.opacity = '1';
            clearAllBtn.style.pointerEvents = 'auto';
        }
    };

    // Render all tasks from the array
    const renderTasks = () => {
        todoList.innerHTML = '';
        tasks.forEach((task, index) => {
            createTaskElement(task, index);
        });
        updateStats();
    };

    // Create a single task DOM element
    const createTaskElement = (task, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.index = index;

        li.innerHTML = `
            <div class="checkbox-container" role="button" tabindex="0" aria-label="Toggle completion">
                <i class="fas fa-check"></i>
            </div>
            <span class="todo-text">${escapeHTML(task.text)}</span>
            <button class="delete-btn" aria-label="Delete task">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        // Event Listener: Toggle complete status
        const checkbox = li.querySelector('.checkbox-container');
        checkbox.addEventListener('click', () => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            li.classList.toggle('completed');
            updateStats();
        });

        // Event Listener: Delete task with animation
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            li.classList.add('deleting');
            
            // Wait for slideOut animation (400ms) to complete before removing from DOM
            setTimeout(() => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks(); // Re-render to ensure indices are correct
            }, 400); 
        });

        todoList.appendChild(li);
    };

    // Helper: Prevent XSS attacks from user input
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // Event Listener: Add new task
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        
        if (text !== '') {
            const newTask = { text, completed: false };
            tasks.push(newTask);
            saveTasks();
            
            // Add directly to DOM to preserve animation on new item
            createTaskElement(newTask, tasks.length - 1);
            updateStats();
            
            todoInput.value = ''; // Reset input
        }
    });

    // Event Listener: Clear all tasks
    clearAllBtn.addEventListener('click', () => {
        if (tasks.length > 0) {
            // Add exit animation to all existing elements
            const items = todoList.querySelectorAll('.todo-item');
            items.forEach(item => item.classList.add('deleting'));
            
            setTimeout(() => {
                tasks = [];
                saveTasks();
                renderTasks();
            }, 400);
        }
    });

    // Initial render on load
    renderTasks();
});
