const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const taskCounter = document.getElementById("task-counter");
const emptyState = document.getElementById("empty-state");
const clearCompletedBtn = document.getElementById("clear-completed-btn");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editingTaskId = null;

// Initial button state
addTaskBtn.disabled = true;

// Enable or disable Add button
taskInput.addEventListener("input", function () {
    addTaskBtn.disabled = taskInput.value.trim() === "";
});

// Add task
addTaskBtn.addEventListener("click", addTask);

// Clear completed tasks
clearCompletedBtn.addEventListener("click", function () {
    tasks = tasks.filter(function (task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
});

// Add task with Enter
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// Add task function
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        })
    };

    tasks.push(task);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    addTaskBtn.disabled = true;
    taskInput.focus();
}

// Render tasks
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(function (task) {
            return !task.completed;
        });
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(function (task) {
            return task.completed;
        });
    }

    // Empty state
    if (filteredTasks.length === 0) {
        emptyState.style.display = "block";

        if (currentFilter === "active") {
            emptyState.textContent = "No active tasks. Great job!";
        } else if (currentFilter === "completed") {
            emptyState.textContent = "No completed tasks yet.";
        } else {
            emptyState.textContent = "No tasks yet. Add your first task!";
        }
    } else {
        emptyState.style.display = "none";
    }

    // Display tasks
    filteredTasks.forEach(function (task) {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const taskContent = document.createElement("div");
        taskContent.className = "task-content";

        // Inline editing mode
        if (task.id === editingTaskId) {
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.className = "edit-input";
            editInput.value = task.text;
            editInput.setAttribute("aria-label", "Edit task");

            taskContent.appendChild(editInput);

            const saveBtn = document.createElement("button");
            saveBtn.textContent = "Save";
            saveBtn.className = "save-btn";
            saveBtn.dataset.id = task.id;

            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancel";
            cancelBtn.className = "cancel-btn";
            cancelBtn.dataset.id = task.id;

            li.appendChild(taskContent);
            li.appendChild(saveBtn);
            li.appendChild(cancelBtn);

            editInput.focus();

            } else {
            // Normal task text
            const taskSpan = document.createElement("button");
            taskSpan.type = "button";
            taskSpan.textContent = task.text;
            taskSpan.className = "task-text";
            taskSpan.dataset.id = task.id;
            taskSpan.setAttribute("aria-pressed", task.completed);

            taskContent.appendChild(taskSpan);

            // Creation date
            if (task.createdAt) {
                const taskDate = document.createElement("small");
                taskDate.className = "task-date";
                taskDate.textContent = task.createdAt;
                taskContent.appendChild(taskDate);
            }

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";
            editBtn.dataset.id = task.id;

            li.appendChild(taskContent);
            li.appendChild(editBtn);
        }

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.id = task.id;

        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    // Update counter
    const remainingTasks = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    taskCounter.textContent = remainingTasks === 1
        ? "1 task left"
        : remainingTasks + " tasks left";
}

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Handle task buttons
taskList.addEventListener("click", function (event) {
    const id = Number(event.target.dataset.id);

    // Start editing
    if (event.target.classList.contains("edit-btn")) {
        editingTaskId = id;
        renderTasks();
        return;
    }

    // Save edited task
    if (event.target.classList.contains("save-btn")) {
        const task = tasks.find(function (task) {
            return task.id === id;
        });

        const editInput = event.target.parentElement.querySelector(".edit-input");

        if (task && editInput && editInput.value.trim() !== "") {
            task.text = editInput.value.trim();
            saveTasks();
            editingTaskId = null;
            renderTasks();
        }

        return;
    }

    // Cancel editing
    if (event.target.classList.contains("cancel-btn")) {
        editingTaskId = null;
        renderTasks();
        return;
    }

    // Delete task
    if (event.target.classList.contains("delete-btn")) {
        tasks = tasks.filter(function (task) {
            return task.id !== id;
        });

        if (editingTaskId === id) {
            editingTaskId = null;
        }

        saveTasks();
        renderTasks();
        return;
    }

    // Complete or uncomplete task
    if (event.target.classList.contains("task-text")) {
        const task = tasks.find(function (task) {
            return task.id === id;
        });

        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }
});

// Enter to save and Escape to cancel
taskList.addEventListener("keydown", function (event) {
    if (!event.target.classList.contains("edit-input")) {
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();

        const saveBtn = event.target.parentElement.parentElement.querySelector(".save-btn");

        if (saveBtn) {
            saveBtn.click();
        }
    }

    if (event.key === "Escape") {
        editingTaskId = null;
        renderTasks();
    }
});

// Task filters
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        editingTaskId = null;

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});

// Initial render
renderTasks();

