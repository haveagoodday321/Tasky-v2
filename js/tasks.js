/* ======================================
   TASKY V2
   tasks.js
   Core Task System - Stage 1
====================================== */


/* ======================================
   TASK STORAGE
====================================== */

let tasks = [];

let currentSearch = "";

let currentStatus = "all";

let currentPriority = "all";

let currentSort = "newest";


/* ======================================
   LOAD TASKS
====================================== */

function loadTasks() {

    const savedTasks =
        localStorage.getItem("tasks");

    try {

        tasks = savedTasks
            ? JSON.parse(savedTasks)
            : [];

    } catch (error) {

        console.error(
            "Could not load tasks:",
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
   GENERATE TASK ID
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
    deadline = ""
) {

    return {

        id: generateID(),

        text: text.trim(),

        completed: false,

        priority: priority,

        deadline: deadline,

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
            "Task input was not found."
        );

        return;

    }


    const text =
        input.value.trim();


    if (text === "") {

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

        priorityInput.value =
            "Medium";

    }


    renderTasks();

updateDashboard();

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


    if (!input) return;


    const text =
        input.value.trim();


    if (text === "") {

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

showToast(
    "✅ Task added!"
);

}

/* ======================================
   GET FILTERED TASKS
====================================== */

function getFilteredTasks() {

    let filteredTasks =
        [...tasks];


    /* Search */

    if (currentSearch !== "") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.text
                        .toLowerCase()
                        .includes(
                            currentSearch
                                .toLowerCase()
                        )
            );

    }


    /* Status Filter */

    if (currentStatus === "active") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    !task.completed
            );

    }


    if (currentStatus === "completed") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.completed
            );

    }


    /* Priority Filter */

    if (currentPriority !== "all") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.priority
                        .toLowerCase()
                        ===
                    currentPriority
            );

    }


    /* Sorting */

    if (currentSort === "newest") {

        filteredTasks.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

    }


    if (currentSort === "oldest") {

        filteredTasks.sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );

    }


    if (currentSort === "deadline") {

        filteredTasks.sort(
            (a, b) => {

                if (!a.deadline)
                    return 1;

                if (!b.deadline)
                    return -1;

                return (
                    new Date(a.deadline) -
                    new Date(b.deadline)
                );

            }
        );

    }


    if (currentSort === "priority") {

        const priorityOrder = {

            High: 3,
            Medium: 2,
            Low: 1

        };


        filteredTasks.sort(
            (a, b) =>
                priorityOrder[b.priority] -
                priorityOrder[a.priority]
        );

    }


    return filteredTasks;

}

/* ======================================
   RENDER TASKS
====================================== */

function renderTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );


    if (!taskList) return;


    taskList.innerHTML = "";


    const visibleTasks =
    getFilteredTasks();


if (visibleTasks.length === 0) {

    taskList.innerHTML = `

        <li class="empty-state">

            🔍 No tasks match your search
            or filters.

        </li>

    `;

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
                    class="task-title
                    ${
                        task.completed
                            ? "completed"
                            : ""
                    }"
                >

                    ${escapeHTML(task.text)}

                </div>


                <div class="task-meta">

                    <span
                        class="
                        priority
                        ${task.priority.toLowerCase()}
                        "
                    >

                        ${task.priority}

                    </span>


                    ${
                        deadlineText
                            ? `

                            <span class="deadline">

                                📅
                                ${deadlineText}

                            </span>

                            `
                            : ""
                    }

                </div>

            </div>


            <div class="task-buttons">

                <button
                    class="complete-btn"
                    type="button"
                    data-id="${task.id}"
                    title="Complete task"
                >

                    ${
                        task.completed
                            ? "↩"
                            : "✓"
                    }

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
   TASK BUTTON EVENTS
====================================== */

function setupTaskButtons() {

    document
        .querySelectorAll(
            ".complete-btn"
        )
        .forEach(button => {

            button.onclick = () => {

                completeTask(
                    button.dataset.id
                );

            };

        });


    document
        .querySelectorAll(
            ".edit-btn"
        )
        .forEach(button => {

            button.onclick = () => {

                editTask(
                    button.dataset.id
                );

            };

        });


    document
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(button => {

            button.onclick = () => {

                deleteTask(
                    button.dataset.id
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


    showToast(
        task.completed
            ? "🎉 Task completed!"
            : "Task reopened."
    );

}

/* ======================================
   DASHBOARD TASK LISTS
====================================== */

function updateDashboardLists() {

    const focusList =
        document.getElementById("focusList");

    const upcomingList =
        document.getElementById("upcomingList");


    if (!focusList && !upcomingList) {
        return;
    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    /* ==================================
       TODAY'S FOCUS
    ================================== */

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
                            task.deadline
                        );

                    deadline.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    return (
                        deadline.getTime() ===
                        today.getTime()
                    );

                })
                .sort((a, b) => {

                    const priorityOrder = {
                        high: 3,
                        medium: 2,
                        low: 1
                    };

                    return (
                        (priorityOrder[b.priority] || 0) -
                        (priorityOrder[a.priority] || 0)
                    );

                });


        if (todayTasks.length === 0) {

            const empty =
                document.createElement("li");

            empty.textContent =
                "Nothing planned for today 🎉";

            focusList.appendChild(
                empty
            );

        } else {

            todayTasks.forEach(task => {

                const li =
                    document.createElement("li");


                li.textContent =
                    task.text;


                li.classList.add(
                    `priority-${task.priority}`
                );


                focusList.appendChild(
                    li
                );

            });

        }

    }


    /* ==================================
       UPCOMING DEADLINES
    ================================== */

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
                            task.deadline
                        );

                    deadline.setHours(
                        0,
                        0,
                        0,
                        0
                    );


                    return (
                        deadline.getTime() >
                        today.getTime()
                    );

                })
                .sort((a, b) => {

                    return (
                        new Date(a.deadline) -
                        new Date(b.deadline)
                    );

                })
                .slice(0, 5);


        if (upcomingTasks.length === 0) {

            const empty =
                document.createElement("li");

            empty.textContent =
                "No upcoming deadlines 📅";

            upcomingList.appendChild(
                empty
            );

        } else {

            upcomingTasks.forEach(task => {

                const li =
                    document.createElement("li");


                const date =
                    new Date(
                        task.deadline
                    );


                const formattedDate =
                    date.toLocaleDateString(
                        "en-US",
                        {
                            day: "numeric",
                            month: "short"
                        }
                    );


                li.innerHTML =
                    `<strong>${escapeHTML(task.text)}</strong>
                     <span class="dashboard-deadline">
                     ${formattedDate}
                     </span>`;


                li.classList.add(
                    `priority-${task.priority}`
                );


                upcomingList.appendChild(
                    li
                );

            });

        }

    }

                       }

/* ======================================
   DELETE TASK
====================================== */

/* ======================================
   UPDATE DASHBOARD
====================================== */

function updateDashboard() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    /*
       Tasks that are due today
       OR tasks completed today
    */

    const todayTasks =
        tasks.filter(task => {

            const dueToday =
                task.deadline === today;

            const completedToday =
                task.completedAt &&
                task.completedAt.startsWith(today);

            return dueToday || completedToday;

        });


    const completedToday =
        todayTasks.filter(task => {

            return (
                task.completed &&
                task.completedAt &&
                task.completedAt.startsWith(today)
            );

        }).length;


    const remainingToday =
        todayTasks.filter(task => {

            return !task.completed;

        }).length;


    const totalToday =
        completedToday +
        remainingToday;


    const percentage =
        totalToday === 0
            ? 0
            : Math.round(
                (completedToday / totalToday) * 100
            );


    /* ==================================
       COMPLETED COUNT
    ================================== */

    const completedElement =
        document.getElementById(
            "completedCount"
        );


    if (completedElement) {

        completedElement.textContent =
            completedToday;

    }


    /* ==================================
       REMAINING COUNT
    ================================== */

    const remainingElement =
        document.getElementById(
            "remainingCount"
        );


    if (remainingElement) {

        remainingElement.textContent =
            remainingToday;

    }


    /* ==================================
       PERCENTAGE
    ================================== */

    const progressText =
        document.getElementById(
            "todayPercent"
        );


    if (progressText) {

        progressText.textContent =
            `${percentage}%`;

    }


    /* ==================================
       PROGRESS BAR
    ================================== */

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

function deleteTask(id) {

    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    if (!task) return;


    const shouldDelete =
        confirm(
            `Delete "${task.text}"?`
        );


    if (!shouldDelete) return;


    tasks =
        tasks.filter(
            task =>
                String(task.id) !==
                String(id)
        );


    saveTasks();

renderTasks();

updateDashboard();

showToast(
    "🗑️ Task deleted."
);

}


/* ======================================
   EDIT TASK
====================================== */

function editTask(id) {

    const task =
        tasks.find(
            task =>
                String(task.id) ===
                String(id)
        );


    if (!task) return;


    const newText =
        prompt(
            "Edit task:",
            task.text
        );


    if (newText === null) return;


    const cleanedText =
        newText.trim();


    if (cleanedText === "") {

        showToast(
            "Task cannot be empty."
        );

        return;

    }


    task.text =
        cleanedText;


    saveTasks();

    renderTasks();

    showToast(
        "✏️ Task updated!"
    );

}


/* ======================================
   FORMAT DATE
====================================== */

function formatTaskDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


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

    element.textContent = text;

    return element.innerHTML;

}


/* ======================================
   SETUP TASK SYSTEM
====================================== */

function setupTasks() {

    loadTasks();

    renderTasks();


    const addButton =
        document.getElementById(
            "addTaskBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            addTask
        );

    }


    const quickAddButton =
        document.getElementById(
            "quickAddBtn"
        );


    if (quickAddButton) {

        quickAddButton.addEventListener(
            "click",
            quickAddTask
        );

    }
   
   /* ======================================
   SEARCH
====================================== */

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value;

            renderTasks();

        }
    );

}


/* ======================================
   STATUS FILTER
====================================== */

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        event => {

            currentStatus =
                event.target.value;

            renderTasks();

        }
    );

}


/* ======================================
   PRIORITY FILTER
====================================== */

const priorityFilter =
    document.getElementById(
        "priorityFilter"
    );


if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        event => {

            currentPriority =
                event.target.value;

            renderTasks();

        }
    );

}


/* ======================================
   SORT TASKS
====================================== */

const sortTasks =
    document.getElementById(
        "sortTasks"
    );


if (sortTasks) {

    sortTasks.addEventListener(
        "change",
        event => {

            currentSort =
                event.target.value;

            renderTasks();

        }
    );

}


    const taskInput =
        document.getElementById(
            "taskInput"
        );


    if (taskInput) {

        taskInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    addTask();

                }

            }
        );

    }


    const quickTaskInput =
        document.getElementById(
            "quickTaskInput"
        );


    if (quickTaskInput) {

        quickTaskInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    quickAddTask();

                }

            }
        );

    }

}


/* ======================================
   INITIALIZE
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    setupTasks
);
