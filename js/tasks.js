/* ======================================
   TASKY V2
   tasks.js
   Complete Task System
====================================== */


/* ======================================
   TASK DATA
====================================== */

let tasks = [];
let isSavingTask = false;

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
    subtasks = [],
    repeat = "none",
    reminderAt = ""
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

       
repeat: ["none", "daily", "weekly", "monthly"].includes(repeat)
    ? repeat
    : "none",
      
       
reminderAt: reminderAt || "",
       

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
   
    // Refresh views affected by subtask progress.
    if (typeof renderSmartPlanner === "function") {
        renderSmartPlanner();
    }

    if (typeof buildCalendar === "function") {
        buildCalendar();
    }
   


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


/* Calculate the next recurring-task deadline */

function getNextRecurringDeadline(deadline, repeat, recurrenceDay = null) {
    if (!deadline) return "";

    const parts = deadline.split("-").map(Number);

    if (
        parts.length !== 3 ||
        parts.some(Number.isNaN)
    ) {
        return "";
    }

    const [year, month, day] = parts;
    const next = new Date(year, month - 1, day);

    if (repeat === "daily") {
        next.setDate(next.getDate() + 1);
    } else if (repeat === "weekly") {
        next.setDate(next.getDate() + 7);
    } else if (repeat === "monthly") {
        // Preserve the original intended day, even when a month
        // is too short to contain it.
        const anchorDay = Number(recurrenceDay) || day;
        const targetYear = next.getFullYear() +
            (next.getMonth() === 11 ? 1 : 0);
        const targetMonth = (next.getMonth() + 1) % 12;

        const lastDay = new Date(
            targetYear,
            targetMonth + 1,
            0
        ).getDate();

        next.setDate(1);
        next.setFullYear(targetYear);
        next.setMonth(targetMonth);
        next.setDate(Math.min(anchorDay, lastDay));
    } else {
        return "";
    }

    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, "0");
    const dd = String(next.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}



/* Calculate the next reminder for a recurring task */

/* Calculate the next reminder for a recurring task */
function getNextRecurringReminder(
    reminderAt,
    repeat,
    recurrenceDay = null
) {
    if (!reminderAt) return "";

    const current = new Date(reminderAt);

    if (Number.isNaN(current.getTime())) {
        return "";
    }

    const anchorDay = Number(recurrenceDay) || current.getDate();

    if (repeat === "daily") {
        current.setDate(current.getDate() + 1);
    } else if (repeat === "weekly") {
        current.setDate(current.getDate() + 7);
    } else if (repeat === "monthly") {
        const targetYear = current.getFullYear() +
            (current.getMonth() === 11 ? 1 : 0);
        const targetMonth = (current.getMonth() + 1) % 12;

        const lastDay = new Date(
            targetYear,
            targetMonth + 1,
            0
        ).getDate();

        current.setDate(1);
        current.setFullYear(targetYear);
        current.setMonth(targetMonth);
        current.setDate(Math.min(anchorDay, lastDay));
    } else {
        return "";
    }

    const pad = value => String(value).padStart(2, "0");

    return (
        `${current.getFullYear()}-${pad(current.getMonth() + 1)}` +
        `-${pad(current.getDate())}T${pad(current.getHours())}` +
        `:${pad(current.getMinutes())}`
    );
}



function completeTask(id) {
    const task = tasks.find(
        item => String(item.id) === String(id)
    );

    if (!task) return;

    const wasCompleted = task.completed;
task.completed = !task.completed;

// Count only a genuine transition to completed.
if (!wasCompleted && task.completed &&
    typeof recordTaskCompletion === "function") {
    recordTaskCompletion(task);
}

    task.completedAt = task.completed
        ? new Date().toISOString()
        : null;

    // Generate the next occurrence only when this task
// transitions from incomplete to complete, and only
// if the next occurrence has not already been created.
if (
    task.completed &&
    ["daily", "weekly", "monthly"].includes(task.repeat) &&
    !tasks.some(item => String(item.recurringFrom) === String(task.id))
) {
        
const originalRecurrenceDay =
    Number(task.recurrenceDay) ||
    (task.deadline ? Number(task.deadline.split("-")[2]) : null);

const nextDeadline = getNextRecurringDeadline(
    task.deadline,
    task.repeat,
    originalRecurrenceDay
);
   

        const nextTask = createTask(
            task.text,
            task.priority,
            nextDeadline,
            task.description,
            task.duration,
            task.category,
            [...(task.tags || [])],
            (task.subtasks || []).map(subtask => ({
                ...subtask,
                id: generateID(),
                completed: false
            })),
                        task.repeat,
            getNextRecurringReminder(
    task.reminderAt,
    task.repeat,
    task.reminderRecurrenceDay ||
        (task.reminderAt
            ? Number(task.reminderAt.slice(8, 10))
            : null)
)
        );

        // Link the new occurrence to the original task.
        nextTask.recurringFrom = task.id;
   nextTask.recurrenceDay = originalRecurrenceDay;
   nextTask.reminderRecurrenceDay =
    Number(task.reminderRecurrenceDay) ||
    (task.reminderAt
        ? Number(task.reminderAt.slice(8, 10))
        : null);

        tasks.unshift(nextTask);
        task.nextOccurrenceCreated = true;
    }

    
saveTasks();
renderTasks();
updateDashboard();
updateAnalytics();

// Keep the planner and calendar in sync with task changes.
if (typeof renderSmartPlanner === "function") {
    renderSmartPlanner();
}

if (typeof buildCalendar === "function") {
    buildCalendar();
           }
   

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
// Keep the Smart Planner and Calendar in sync.
if (typeof renderSmartPlanner === "function") {
    renderSmartPlanner();
}

if (typeof buildCalendar === "function") {
    buildCalendar();
}


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

/* ==================================
   SMART PLAN
================================== */

if (focusList) {

    focusList.innerHTML = "";


    const recommendedTasks =
        typeof getTopPlannedTasks === "function"
            ? getTopPlannedTasks(
                tasks,
                3
            )
            : [];


    if (
        recommendedTasks.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "smart-plan-empty";


        empty.innerHTML = `

            <span>
                🎯
            </span>

            <p>
                Nothing needs your attention right now.
            </p>

        `;


        focusList.appendChild(
            empty
        );


    } else {

        recommendedTasks.forEach(
            (task, index) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "smart-plan-item";


                const reason =
                    typeof getPlannerReason ===
                    "function"

                        ? getPlannerReason(task)

                        : "Recommended next task";


                const duration =
                    typeof formatDuration ===
                    "function"

                        ? formatDuration(
                            task.duration
                        )

                        : `${task.duration || 60} min`;


                item.innerHTML = `

                    <div class="smart-plan-number">

                        ${index + 1}

                    </div>


                    <div class="smart-plan-content">

                        <strong>

                            ${escapeHTML(
                                task.text
                            )}

                        </strong>


                        <div class="smart-plan-meta">

                            <span>
                                ${
                                    task.priority === "High"
                                        ? "🔴"
                                        : task.priority === "Medium"
                                            ? "🟠"
                                            : "🟢"
                                }
                                ${escapeHTML(
                                    task.priority ||
                                    "Medium"
                                )}
                            </span>


                            <span>
                                ⏱️ ${duration}
                            </span>

                        </div>


                        <small>

                            ${escapeHTML(
                                reason
                            )}

                        </small>

                    </div>

                `;


                focusList.appendChild(
                    item
                );

            }
        );

    }

}
    

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

   const viewSmartPlanBtn =
    document.getElementById(
        "viewSmartPlanBtn"
    );

if (viewSmartPlanBtn) {

    viewSmartPlanBtn.onclick =
        function () {

            if (
                typeof showPage ===
                "function"
            ) {

                showPage(
                    "plannerSection"
                );

            }

        };

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

   if (categoryFilter) {

    categoryFilter.onchange =
        function () {

            currentCategory =
                this.value;

            renderTasks();

        };

   }

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

   
const repeat = document.getElementById("modalRepeat");
   

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
   isSavingTask = false;

const saveButton = document.getElementById("saveTaskModalBtn");

if (saveButton) {
    saveButton.disabled = false;
    saveButton.textContent = "Save Task";
}


    title.textContent =
        "Create Task";


    input.value = "";

    description.value = "";

   document.getElementById("modalReminderAt").value = "";

    deadline.value = "";

    priority.value = "Medium";
   
duration.value = "60";

category.value = "Other";

   repeat.value = "none";

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
   isSavingTask = false;

const saveButton = document.getElementById("saveTaskModalBtn");

if (saveButton) {
    saveButton.disabled = false;
    saveButton.textContent = "Save Task";
}


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

   const repeat = document.getElementById("modalRepeat");
   
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

   document.getElementById("modalReminderAt").value =
    task.reminderAt || "";


    priority.value =
        task.priority || "Medium";
   duration.value =
    task.duration || 60;

category.value =
    task.category || "Other";

   repeat.value = task.repeat || "none";

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
    subtask.completed === true,
    subtask.id
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
    completed = false,
    subtaskId = null
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

   row.dataset.subtaskId = subtaskId || generateID();
row.dataset.completed = String(completed);


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
    const inputs = document.querySelectorAll(
        ".subtask-input"
    );

    return Array.from(inputs)
        .map(input => {
            const row = input.closest(".subtask-row");
            const text = input.value.trim();

            if (!text || !row) {
                return null;
            }

            return {
                id: row.dataset.subtaskId || generateID(),
                text,
                completed: row.dataset.completed === "true"
            };
        })
        .filter(Boolean);
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

const saveButton = document.getElementById("saveTaskModalBtn");

if (saveButton) {
    saveButton.disabled = false;
    saveButton.textContent = "Save Task";
}


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

   const repeat = document.getElementById("modalRepeat");
   
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

   // Prevent repeated clicks from saving duplicate tasks.
if (isSavingTask) {
    return;
}

isSavingTask = true;

const saveButton = document.getElementById("saveTaskModalBtn");

if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
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
       // Preserve previous values to detect date changes.
const previousDeadline = task.deadline;
const previousReminderAt = task.reminderAt;
const previousRepeat = task.repeat;


        task.text =
            text;

        task.description =
            description.value.trim();

        task.deadline =
            deadline.value;

       task.reminderAt =
    document.getElementById("modalReminderAt").value || "";

        task.priority =
            priority.value;

       task.duration =
    Number(duration.value) || 60;

task.category =
    category.value || "Other";

       task.repeat = repeat.value || "none";
       // Keep recurring dates aligned with intentional edits.
if (
    task.deadline !== previousDeadline ||
    (
        previousRepeat !== task.repeat &&
        task.repeat === "monthly"
    )
) {
    task.recurrenceDay = task.deadline
        ? Number(task.deadline.split("-")[2])
        : null;
}

if (
    task.reminderAt !== previousReminderAt ||
    (
        previousRepeat !== task.repeat &&
        task.repeat === "monthly"
    )
) {
    task.reminderRecurrenceDay = task.reminderAt
        ? Number(task.reminderAt.slice(8, 10))
        : null;
}

task.tags =
    taskTags;

task.subtasks =
    taskSubtasks;

        saveTasks();

       closeTaskModal();

        renderTasks();

        updateDashboard();

        updateAnalytics();

       
        // Refresh the Smart Planner and Calendar.
        if (typeof renderSmartPlanner === "function") {
            renderSmartPlanner();
        }

        if (typeof buildCalendar === "function") {
            buildCalendar();
        }
       


        showToast(
            "✅ Task updated!"
        );



        return;

    }


    /* CREATE NEW TASK */


const newTask = createTask(
    text,
    priority.value,
    deadline.value,
    description.value,
    duration.value,
    category.value,
    taskTags,
    taskSubtasks,
    repeat.value,
    document.getElementById("modalReminderAt").value
);
   



    tasks.unshift(
        newTask
    );


    saveTasks();

   closeTaskModal();

    renderTasks();

    updateDashboard();

    updateAnalytics();

   
        // Refresh the Smart Planner and Calendar.
        if (typeof renderSmartPlanner === "function") {
            renderSmartPlanner();
        }

        if (typeof buildCalendar === "function") {
            buildCalendar();
        }
   


    showToast(
        "✅ Task created!"
    );


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
