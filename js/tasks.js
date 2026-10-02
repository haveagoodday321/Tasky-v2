/* ======================================
   TASKY V2
   tasks.js
   Complete Task System
====================================== */


/* ======================================
   TASK DATA
====================================== */

let tasks = [];

let currentSearch = "";
let currentStatus = "all";
let currentPriority = "all";
let currentCategory = "all";
let currentSort = "newest";


/* ======================================
   LOAD TASKS
====================================== */

function loadTasks() {

    const savedTasks =
        localStorage.getItem("tasks");

    if (!savedTasks) {
        tasks = [];
        return;
    }

    try {

        const parsed =
            JSON.parse(savedTasks);

        tasks =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "Task storage error:",
            error
        );

        tasks = [];

    }

}


/* ======================================
   SAVE TASKS
====================================== */

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


/* ======================================
   GENERATE ID
====================================== */

function generateID() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(16)
            .slice(2)
    );

}


/* ======================================
   CREATE TASK
====================================== */

function createTask(
    text,
    priority = "Medium",
    deadline = "",
    description = "",
    duration = 60,
    category = "Other",
    tags = [],
    subtasks = []
) {

    return {

        id: generateID(),

        text: text.trim(),

        description:
            description.trim(),

        completed: false,

        priority: priority,

        deadline: deadline,

        duration:
            Number(duration) || 60,

        category:
            category || "Other",

        tags:
            Array.isArray(tags)
                ? tags
                : [],

        subtasks:
            Array.isArray(subtasks)
                ? subtasks
                : [],

        createdAt:
            new Date().toISOString(),

        completedAt: null

    };

}

/* ======================================
   ADD TASK
====================================== */

function addTask() {

    const input =
        document.getElementById(
            "taskInput"
        );

    const priorityInput =
        document.getElementById(
            "priority"
        );

    const deadlineInput =
        document.getElementById(
            "deadline"
        );


    if (!input) {

        console.error(
            "taskInput was not found."
        );

        return;

    }


    const text =
        input.value.trim();


    if (!text) {

        showToast(
            "Please enter a task."
        );

        input.focus();

        return;

    }


    const priority =
        priorityInput
            ? priorityInput.value
            : "Medium";


    const deadline =
        deadlineInput
            ? deadlineInput.value
            : "";


    const newTask =
        createTask(
            text,
            priority,
            deadline
        );


    tasks.unshift(newTask);

    saveTasks();


    /* Clear form */

    input.value = "";

    if (deadlineInput) {
        deadlineInput.value = "";
    }

    if (priorityInput) {
        priorityInput.value = "Medium";
    }


    /* Update everything */

    renderTasks();

    updateDashboard();

    updateAnalytics();


    showToast(
        "✅ Task added!"
    );

}


/* ======================================
   QUICK ADD TASK
====================================== */

function quickAddTask() {

    const input =
        document.getElementById(
            "quickTaskInput"
        );


    if (!input) {

        console.error(
            "quickTaskInput was not found."
        );

        return;

    }


    const text =
        input.value.trim();


    if (!text) {

        showToast(
            "Enter a task first."
        );

        input.focus();

        return;

    }


    const newTask =
        createTask(text);


    tasks.unshift(newTask);

    saveTasks();


    input.value = "";


    renderTasks();

    updateDashboard();

    updateAnalytics();


    showToast(
        "✅ Task added!"
    );

}


/* ======================================
   FILTER + SORT
====================================== */

function getFilteredTasks() {

    let filtered =
        [...tasks];


    /* SEARCH */

    if (currentSearch.trim() !== "") {

        const search =
            currentSearch
                .trim()
                .toLowerCase();

filtered =
    filtered.filter(task => {

        const taskText =
            (task.text || "")
                .toLowerCase();

        const taskTags =
            Array.isArray(task.tags)
                ? task.tags.join(" ").toLowerCase()
                : "";

        const taskCategory =
            (task.category || "")
                .toLowerCase();

        return (
            taskText.includes(search) ||
            taskTags.includes(search) ||
            taskCategory.includes(search)
        );

    });

    }


    /* STATUS */

    if (currentStatus === "active") {

        filtered =
            filtered.filter(
                task =>
                    !task.completed
            );

    }


    if (currentStatus === "completed") {

        filtered =
            filtered.filter(
                task =>
                    task.completed
            );

    }


    /* PRIORITY */

    if (currentPriority !== "all") {

        filtered =
            filtered.filter(task =>

                task.priority
                    .toLowerCase()
                ===
                currentPriority

            );

    }
   
/* CATEGORY */

if (currentCategory !== "all") {

    filtered =
        filtered.filter(task =>

            (task.category || "Other")
                ===
            currentCategory

        );

}

    /* SORT */

    if (currentSort === "newest") {

        filtered.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

    }


    if (currentSort === "oldest") {

        filtered.sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );

    }


    if (currentSort === "deadline") {

        filtered.sort((a, b) => {

            if (!a.deadline) return 1;

            if (!b.deadline) return -1;

            return (
                new Date(a.deadline) -
                new Date(b.deadline)
            );

        });

    }


    if (currentSort === "priority") {

        const priorityOrder = {

            high: 3,

            medium: 2,

            low: 1

        };


        filtered.sort((a, b) => {

            return (

                (priorityOrder[
                    b.priority.toLowerCase()
                ] || 0)

                -

                (priorityOrder[
                    a.priority.toLowerCase()
                ] || 0)

            );

        });

    }


    return filtered;

}


/* ======================================
   RENDER TASKS
====================================== */

function renderTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );


    if (!taskList) {

        console.warn(
            "taskList was not found."
        );

        return;

    }


    taskList.innerHTML = "";


    const visibleTasks =
        getFilteredTasks();


    if (visibleTasks.length === 0) {

        const empty =
            document.createElement("li");

        empty.className =
            "empty-state";

        empty.textContent =
            tasks.length === 0
                ? "No tasks yet. Add your first task! 🎯"
                : "🔍 No tasks match your search or filters.";

        taskList.appendChild(empty);

        return;

    }


    visibleTasks.forEach(task => {

        const li =
            document.createElement("li");


        li.className =
            "task-card";


        const deadlineText =
            task.deadline
                ? formatTaskDate(
                    task.deadline
                )
                : "";


        li.innerHTML = `

            <div class="task-info">

                <div
                    class="task-title ${
                        task.completed
                            ? "completed"
                            : ""
                    }"
                >
                    ${escapeHTML(task.text)}
                </div>

<div class="task-meta">

    <span
        class="priority ${task.priority.toLowerCase()}"
    >
        ${escapeHTML(task.priority)}
    </span>


    ${
        deadlineText
            ? `
                <span class="deadline">
                    📅 ${deadlineText}
                </span>
            `
            : ""
    }


    ${
        task.duration
            ? `
                <span class="duration">
                    ⏱️ ${formatDuration(task.duration)}
                </span>
            `
            : ""
    }


    ${
        task.category
            ? `
                <span class="category">
                    ${escapeHTML(task.category)}
                </span>
            `
            : ""
    }

    ${
    Array.isArray(task.tags) &&
    task.tags.length > 0
        ? `
            <div class="task-tags">

                ${task.tags.map(
                    tag => `
                        <span class="task-tag">
                            #${escapeHTML(tag)}
                        </span>
                    `
                ).join("")}

            </div>
        `
        : ""
    }

</div>

${
    Array.isArray(task.subtasks) &&
    task.subtasks.length > 0
        ? `
            <div class="subtask-progress">

                <div class="subtask-progress-header">

                    <span>
                        🧩 Subtasks
                    </span>

                    <strong>
                        ${getCompletedSubtaskCount(task)}
                        /
                        ${task.subtasks.length}
                    </strong>

                </div>


                <div class="subtask-progress-track">

                    <div
                        class="subtask-progress-fill"
                        style="width: ${getSubtaskProgress(task)}%"
                    ></div>

                </div>


                <div class="subtask-list-preview">

                    ${task.subtasks.map(
                        subtask => `
                            <button
                                type="button"
                                class="subtask-check ${
                                    subtask.completed
                                        ? "completed"
                                        : ""
                                }"
                                data-task-id="${task.id}"
                                data-subtask-id="${subtask.id}"
                            >

                                <span class="subtask-check-icon">
                                    ${
                                        subtask.completed
                                            ? "✓"
                                            : "○"
                                    }
                                </span>

                                <span class="subtask-check-text">
                                    ${escapeHTML(
                                        subtask.text
                                    )}
                                </span>

                            </button>
                        `
                    ).join("")}

                </div>

            </div>
        `
        : ""
}
                
            </div>


            <div class="task-buttons">

                <button
                    class="complete-btn"
                    type="button"
                    data-id="${task.id}"
                    title="Complete task"
                >
                    ${task.completed ? "↩" : "✓"}
                </button>


                <button
                    class="edit-btn"
                    type="button"
                    data-id="${task.id}"
                    title="Edit task"
                >
                    ✏
                </button>


                <button
                    class="delete-btn"
                    type="button"
                    data-id="${task.id}"
                    title="Delete task"
                >
                    🗑
                </button>

            </div>

        `;


        taskList.appendChild(li);

    });


    setupTaskButtons();

}

/* ======================================
   TOGGLE SUBTASK
====================================== */

function toggleSubtask(
    taskId,
    subtaskId
) {

    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(taskId)
        );


    if (!task) return;


    if (
        !Array.isArray(task.subtasks)
    ) {

        return;

    }


    const subtask =
        task.subtasks.find(
            item =>
                String(item.id) ===
                String(subtaskId)
        );


    if (!subtask) return;


    subtask.completed =
        !subtask.completed;


    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();


    showToast(
        subtask.completed
            ? "✅ Subtask completed!"
            : "Subtask reopened."
    );

}

/* ======================================
   TASK BUTTONS
====================================== */

function setupTaskButtons() {

    document
        .querySelectorAll(".complete-btn")
        .forEach(button => {

            button.onclick = function () {

                completeTask(
                    this.dataset.id
                );

            };

        });


    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.onclick = function () {

                editTask(
                    this.dataset.id
                );

            };

        });


    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.onclick = function () {

                deleteTask(
                    this.dataset.id
                );

            };

        });
       document
        .querySelectorAll(".subtask-check")
        .forEach(button => {

            button.onclick = function () {

                toggleSubtask(
                    this.dataset.taskId,
                    this.dataset.subtaskId
                );

            };

        });

}


/* ======================================
   COMPLETE TASK
====================================== */

function completeTask(id) {

    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    if (!task) return;


    task.completed =
        !task.completed;


    task.completedAt =
        task.completed
            ? new Date().toISOString()
            : null;


    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();


    showToast(
        task.completed
            ? "🎉 Task completed!"
            : "Task reopened."
    );

}


/* ======================================
   DELETE TASK
====================================== */

function deleteTask(id) {

    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    if (!task) return;


    const confirmed =
        confirm(
            `Delete "${task.text}"?`
        );


    if (!confirmed) return;


    tasks =
        tasks.filter(
            task =>
                String(task.id) !==
                String(id)
        );


    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();


    showToast(
        "🗑️ Task deleted."
    );

}


/* ======================================
   EDIT TASK
====================================== */

function editTask(id) {

    openEditTaskModal(id);

}


/* ======================================
   FORMAT DATE
====================================== */

function formatTaskDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* ======================================
   ESCAPE HTML
====================================== */

function escapeHTML(text) {

    const element =
        document.createElement("div");

    element.textContent =
        text;

    return element.innerHTML;

}


/* ======================================
   DASHBOARD
====================================== */

function updateDashboard() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayTasks =
        tasks.filter(task => {

            const dueToday =
                task.deadline === today;


            const completedToday =
                task.completedAt &&
                task.completedAt.startsWith(
                    today
                );


            return (
                dueToday ||
                completedToday
            );

        });


    const completedToday =
        todayTasks.filter(task =>

            task.completed &&
            task.completedAt &&
            task.completedAt.startsWith(today)

        ).length;


    const remainingToday =
        todayTasks.filter(
            task =>
                !task.completed
        ).length;


    const totalToday =
        completedToday +
        remainingToday;


    const percentage =
        totalToday === 0
            ? 0
            : Math.round(
                (
                    completedToday /
                    totalToday
                ) * 100
            );


    const completedElement =
        document.getElementById(
            "completedCount"
        );


    if (completedElement) {

        completedElement.textContent =
            completedToday;

    }


    const remainingElement =
        document.getElementById(
            "remainingCount"
        );


    if (remainingElement) {

        remainingElement.textContent =
            remainingToday;

    }


    const percentElement =
        document.getElementById(
            "todayPercent"
        );


    if (percentElement) {

        percentElement.textContent =
            `${percentage}%`;

    }


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            `${percentage}%`;

    }


    updateDashboardLists();

}


/* ======================================
   DASHBOARD LISTS
====================================== */

function updateDashboardLists() {

    const focusList =
        document.getElementById(
            "focusList"
        );

    const upcomingList =
        document.getElementById(
            "upcomingList"
        );


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    /* TODAY'S FOCUS */

    if (focusList) {

        focusList.innerHTML = "";


        const todayTasks =
            tasks
                .filter(task => {

                    if (task.completed) {
                        return false;
                    }

                    if (!task.deadline) {
                        return false;
                    }


                    const deadline =
                        new Date(
                            `${task.deadline}T00:00:00`
                        );


                    return (
                        deadline.getTime() ===
                        today.getTime()
                    );

                })
                .sort((a, b) => {

                    const order = {

                        high: 3,
                        medium: 2,
                        low: 1

                    };


                    return (
                        (order[
                            b.priority.toLowerCase()
                        ] || 0)

                        -

                        (order[
                            a.priority.toLowerCase()
                        ] || 0)
                    );

                });


        if (todayTasks.length === 0) {

            const li =
                document.createElement("li");

            li.textContent =
                "Nothing planned for today 🎉";

            focusList.appendChild(li);

        } else {

            todayTasks.forEach(task => {

                const li =
                    document.createElement("li");

                li.textContent =
                    task.text;

                li.classList.add(
                    `priority-${task.priority.toLowerCase()}`
                );

                focusList.appendChild(li);

            });

        }

    }


    /* UPCOMING */

    if (upcomingList) {

        upcomingList.innerHTML = "";


        const upcomingTasks =
            tasks
                .filter(task => {

                    if (task.completed) {
                        return false;
                    }

                    if (!task.deadline) {
                        return false;
                    }


                    const deadline =
                        new Date(
                            `${task.deadline}T00:00:00`
                        );


                    return (
                        deadline.getTime() >
                        today.getTime()
                    );

                })
                .sort((a, b) =>

                    new Date(
                        `${a.deadline}T00:00:00`
                    ) -

                    new Date(
                        `${b.deadline}T00:00:00`
                    )

                )
                .slice(0, 5);


        if (upcomingTasks.length === 0) {

            const li =
                document.createElement("li");

            li.textContent =
                "No upcoming deadlines 📅";

            upcomingList.appendChild(li);

        } else {

            upcomingTasks.forEach(task => {

                const li =
                    document.createElement("li");


                const date =
                    new Date(
                        `${task.deadline}T00:00:00`
                    );


                li.innerHTML = `

                    <strong>
                        ${escapeHTML(task.text)}
                    </strong>

                    <span class="dashboard-deadline">
                        ${date.toLocaleDateString(
                            "en-US",
                            {
                                day: "numeric",
                                month: "short"
                            }
                        )}
                    </span>

                `;


                li.classList.add(
                    `priority-${task.priority.toLowerCase()}`
                );


                upcomingList.appendChild(li);

            });

        }

    }

}


/* ======================================
   SETUP
====================================== */

function setupTasks() {

    loadTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();


    /* ==================================
       QUICK ADD BUTTON
    ================================== */

    const quickButton =
        document.getElementById(
            "quickAddBtn"
        );


    if (quickButton) {

        quickButton.onclick =
            quickAddTask;

    } else {

        console.warn(
            "quickAddBtn was not found."
        );

    }


    /* ==================================
       SEARCH
    ================================== */

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.oninput =
            function () {

                currentSearch =
                    this.value;

                renderTasks();

            };

    }


    /* ==================================
       STATUS FILTER
    ================================== */

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    if (statusFilter) {

        statusFilter.onchange =
            function () {

                currentStatus =
                    this.value;

                renderTasks();

            };

    }


    /* ==================================
       PRIORITY FILTER
    ================================== */

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );
   
const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

    if (priorityFilter) {

        priorityFilter.onchange =
            function () {

                currentPriority =
                    this.value;

                renderTasks();

            };

    }


    /* ==================================
       SORT
    ================================== */

    const sortSelect =
        document.getElementById(
            "sortTasks"
        );


    if (sortSelect) {

        sortSelect.onchange =
            function () {

                currentSort =
                    this.value;

                renderTasks();

            };

    }


    /* ==================================
       ENTER KEY — NORMAL TASK
    ================================== */


    /* ==================================
       ENTER KEY — QUICK ADD
    ================================== */

    const quickInput =
        document.getElementById(
            "quickTaskInput"
        );


    if (quickInput) {

        quickInput.onkeydown =
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    quickAddTask();

                }

            };

    }

}


/* ======================================
   START TASK SYSTEM
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    setupTasks
);

/* ======================================
   TASK MODAL
====================================== */

let editingTaskId = null;


/* OPEN CREATE MODAL */

function openCreateTaskModal() {

    editingTaskId = null;

    const modal =
        document.getElementById("taskModal");

    const title =
        document.getElementById("taskModalTitle");

    const input =
        document.getElementById("modalTaskInput");

    const description =
        document.getElementById(
            "modalTaskDescription"
        );

    const deadline =
        document.getElementById(
            "modalDeadline"
        );

    const priority =
        document.getElementById(
            "modalPriority"
        );

   const duration =
    document.getElementById(
        "modalDuration"
    );

const category =
    document.getElementById(
        "modalCategory"
    );

const tags =
    document.getElementById(
        "modalTags"
    );

const subtasksList =
    document.getElementById(
        "subtasksList"
    );


    if (!modal) return;


    title.textContent =
        "Create Task";


    input.value = "";

    description.value = "";

    deadline.value = "";

    priority.value = "Medium";
   
duration.value = "60";

category.value = "Other";

tags.value = "";

subtasksList.innerHTML = "";

    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        input.focus();

    }, 100);

}


/* OPEN EDIT MODAL */

function openEditTaskModal(id) {

    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    if (!task) return;


    editingTaskId = task.id;


    const modal =
        document.getElementById("taskModal");

    const title =
        document.getElementById(
            "taskModalTitle"
        );

    const input =
        document.getElementById(
            "modalTaskInput"
        );

    const description =
        document.getElementById(
            "modalTaskDescription"
        );

    const deadline =
        document.getElementById(
            "modalDeadline"
        );

    const priority =
        document.getElementById(
            "modalPriority"
        );
   
const duration =
    document.getElementById(
        "modalDuration"
    );

const category =
    document.getElementById(
        "modalCategory"
    );

const tags =
    document.getElementById(
        "modalTags"
    );

const subtasksList =
    document.getElementById(
        "subtasksList"
    );

    title.textContent =
        "Edit Task";


    input.value =
        task.text || "";


    description.value =
        task.description || "";


    deadline.value =
        task.deadline || "";


    priority.value =
        task.priority || "Medium";
   duration.value =
    task.duration || 60;

category.value =
    task.category || "Other";

tags.value =
    Array.isArray(task.tags)
        ? task.tags.join(", ")
        : "";

subtasksList.innerHTML = "";


/* Restore subtasks */

if (Array.isArray(task.subtasks)) {

    task.subtasks.forEach(
        subtask => {

            addSubtaskInput(
                subtask.text || "",
                subtask.completed || false
            );

        }
    );

}


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        input.focus();

    }, 100);

}

/* ======================================
   SUBTASK SYSTEM
====================================== */

function addSubtaskInput(
    text = "",
    completed = false
) {

    const list =
        document.getElementById(
            "subtasksList"
        );

    if (!list) return;


    const row =
        document.createElement("div");

    row.className =
        "subtask-row";


    row.innerHTML = `

        <input
            type="text"
            class="subtask-input"
            placeholder="e.g. Research the topic"
            value="${escapeHTML(text)}"
        >

        <button
            type="button"
            class="remove-subtask-btn"
            aria-label="Remove subtask">

            ×

        </button>

    `;


    const removeButton =
        row.querySelector(
            ".remove-subtask-btn"
        );


    removeButton.addEventListener(
        "click",
        () => {

            row.remove();

        }
    );


    list.appendChild(row);

}


function getSubtasksFromModal() {

    const inputs =
        document.querySelectorAll(
            ".subtask-input"
        );


    return Array.from(inputs)

        .map(input => ({
            id: generateID(),

            text:
                input.value.trim(),

            completed: false
        }))

        .filter(
            subtask =>
                subtask.text.length > 0
        );

}

/* ======================================
   SUBTASK PROGRESS
====================================== */

function getCompletedSubtaskCount(task) {

    if (
        !task ||
        !Array.isArray(task.subtasks)
    ) {

        return 0;

    }


    return task.subtasks.filter(
        subtask =>
            subtask.completed === true
    ).length;

}


function getSubtaskProgress(task) {

    if (
        !task ||
        !Array.isArray(task.subtasks) ||
        task.subtasks.length === 0
    ) {

        return 0;

    }


    const completed =
        getCompletedSubtaskCount(task);


    return Math.round(
        (completed /
            task.subtasks.length) *
        100
    );

}


function formatDuration(minutes) {

    const value =
        Number(minutes) || 0;


    if (value < 60) {

        return `${value} min`;

    }


    const hours =
        Math.floor(value / 60);

    const remaining =
        value % 60;


    if (remaining === 0) {

        return `${hours}h`;

    }


    return `${hours}h ${remaining}m`;

}

/* CLOSE MODAL */

function closeTaskModal() {

    const modal =
        document.getElementById("taskModal");


    if (!modal) return;


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    editingTaskId = null;

}


/* SAVE TASK */

function saveTaskFromModal() {

    const input =
        document.getElementById(
            "modalTaskInput"
        );

    const description =
        document.getElementById(
            "modalTaskDescription"
        );

    const deadline =
        document.getElementById(
            "modalDeadline"
        );

    const priority =
        document.getElementById(
            "modalPriority"
        );
   
const duration =
    document.getElementById(
        "modalDuration"
    );

const category =
    document.getElementById(
        "modalCategory"
    );

const tags =
    document.getElementById(
        "modalTags"
    );

    const text =
        input.value.trim();
   
const taskTags =
    tags.value
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

const taskSubtasks =
    getSubtasksFromModal();

    if (!text) {

        showToast(
            "Please enter a task name."
        );

        input.focus();

        return;

    }


    /* EDIT EXISTING TASK */

    if (editingTaskId !== null) {

        const task =
            tasks.find(
                task =>
                    String(task.id) ===
                    String(editingTaskId)
            );


        if (!task) {

            closeTaskModal();

            return;

        }


        task.text =
            text;

        task.description =
            description.value.trim();

        task.deadline =
            deadline.value;

        task.priority =
            priority.value;

       task.duration =
    Number(duration.value) || 60;

task.category =
    category.value || "Other";

task.tags =
    taskTags;

task.subtasks =
    taskSubtasks;

        saveTasks();

        renderTasks();

        updateDashboard();

        updateAnalytics();


        showToast(
            "✅ Task updated!"
        );


        closeTaskModal();

        return;

    }


    /* CREATE NEW TASK */

    const newTask =
    createTask(
        text,
        priority.value,
        deadline.value,
        description.value,
        duration.value,
        category.value,
        taskTags,
        taskSubtasks
    );



    tasks.unshift(
        newTask
    );


    saveTasks();

    renderTasks();

    updateDashboard();

    updateAnalytics();


    showToast(
        "✅ Task created!"
    );


    closeTaskModal();

}


/* ======================================
   MODAL EVENT LISTENERS
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const openBtn =
            document.getElementById(
                "openTaskModalBtn"
            );


        const closeBtn =
            document.getElementById(
                "closeTaskModalBtn"
            );


        const cancelBtn =
            document.getElementById(
                "cancelTaskModalBtn"
            );


        const saveBtn =
            document.getElementById(
                "saveTaskModalBtn"
            );
       
const addSubtaskBtn =
    document.getElementById(
        "addSubtaskBtn"
    );

       if (addSubtaskBtn) {

    addSubtaskBtn.addEventListener(
        "click",
        () => {

            addSubtaskInput();

        }
    );

       }

        const overlay =
            document.getElementById(
                "taskModalOverlay"
            );


        if (openBtn) {

            openBtn.addEventListener(
                "click",
                openCreateTaskModal
            );

        }


        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                closeTaskModal
            );

        }


        if (cancelBtn) {

            cancelBtn.addEventListener(
                "click",
                closeTaskModal
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeTaskModal
            );

        }


        if (saveBtn) {

            saveBtn.addEventListener(
                "click",
                saveTaskFromModal
            );

        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    closeTaskModal();

                }

            }
        );

    }
);
