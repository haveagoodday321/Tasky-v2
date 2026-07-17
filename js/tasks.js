/* ======================================
   TASKY V2
   tasks.js
   Part 1
====================================== */

// -------------------------------
// Tasks Array
// -------------------------------

let tasks =
JSON.parse(localStorage.getItem("tasks")) || [];


// -------------------------------
// Save Tasks
// -------------------------------

function saveTasks(){

localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);

}


// -------------------------------
// Load Tasks
// -------------------------------

function loadTasks(){

const saved =
localStorage.getItem("tasks");

if(saved){

tasks = JSON.parse(saved);

}else{

tasks = [];

}

}


// -------------------------------
// Generate Task ID
// -------------------------------

function generateID(){

return Date.now() +
Math.floor(Math.random()*1000);

}


// -------------------------------
// Add Task
// -------------------------------

function addTask(){

const input =
document.getElementById("taskInput");

const deadline =
document.getElementById("deadline");

const priority =
document.getElementById("priority");

if(!input) return;

const text =
input.value.trim();

if(text===""){

showToast("Please enter a task.");

return;

}

const task = {

id:generateID(),

text:text,

completed:false,

priority:
priority ?
priority.value :
"Medium",

deadline:
deadline ?
deadline.value :
"",

createdAt:
new Date().toISOString()

};

tasks.push(task);

saveTasks();

input.value="";

if(deadline)
deadline.value="";

if(priority)
priority.selectedIndex=1;

showToast("✅ Task Added");

refreshApp();

}


// -------------------------------
// Quick Add
// -------------------------------

function quickAddTask(){

const input =
document.getElementById(
"quickTaskInput"
);

if(!input) return;

const text =
input.value.trim();

if(text===""){

showToast("Enter a task.");

return;

}

tasks.push({

id:generateID(),

text:text,

completed:false,

priority:"Medium",

deadline:"",

createdAt:
new Date().toISOString()

});

saveTasks();

input.value="";

showToast("Task Added");

refreshApp();

}


// -------------------------------
// Event Listeners
// -------------------------------

document.addEventListener(
"DOMContentLoaded",
()=>{

const addButton =
document.getElementById(
"addTaskBtn"
);

if(addButton){

addButton.addEventListener(
"click",
addTask
);

}

const quickButton =
document.getElementById(
"quickAddBtn"
);

if(quickButton){

quickButton.addEventListener(
"click",
quickAddTask
);

}

loadTasks();

});

/* ======================================
   TASKY V2
   tasks.js
   Part 2
====================================== */

// -------------------------------
// Render Tasks
// -------------------------------

function renderTasks() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
        <li class="empty-state">
            📋 No tasks yet.<br>
            Add your first task!
        </li>
        `;

        return;
    }

    tasks.forEach(task => {

        const li = document.createElement("li");

        li.className = "task-card";

        let priorityColor = "#22C55E";

        if (task.priority === "Medium") {

            priorityColor = "#F59E0B";

        }

        if (task.priority === "High") {

            priorityColor = "#EF4444";

        }

        let deadlineText = "";

        if (task.deadline !== "") {

            deadlineText =
            `<small>📅 ${task.deadline}</small>`;

        }

        li.innerHTML = `

<div>

<h3 class="${
task.completed ? "completed" : ""
}">
${task.text}
</h3>

<p style="color:${priorityColor};font-weight:600;">
${task.priority}
</p>

${deadlineText}

</div>

<div class="task-buttons">

<button onclick="completeTask(${task.id})">
✔
</button>

<button onclick="editTask(${task.id})">
✏
</button>

<button onclick="deleteTask(${task.id})">
🗑
</button>

</div>

`;

        taskList.appendChild(li);

    });

}

// -------------------------------
// Complete Task
// -------------------------------

function completeTask(id){

const task =
tasks.find(
t => t.id === id
);

if(!task) return;

task.completed =
!task.completed;

saveTasks();

showToast(
task.completed ?
"Task Completed 🎉"
:
"Task Reopened"
);

refreshApp();

}

// -------------------------------
// Delete Task
// -------------------------------

function deleteTask(id){

const confirmDelete =
confirm(
"Delete this task?"
);

if(!confirmDelete)
return;

tasks =
tasks.filter(
task => task.id !== id
);

saveTasks();

showToast(
"Task Deleted"
);

refreshApp();

}

// -------------------------------
// Edit Task
// -------------------------------

function editTask(id){

const task =
tasks.find(
t => t.id === id
);

if(!task) return;

const newText =
prompt(
"Edit Task",
task.text
);

if(newText===null)
return;

if(newText.trim()==="")
return;

task.text =
newText.trim();

saveTasks();

showToast(
"Task Updated"
);

refreshApp();

}

/* ======================================
   TASKY V2
   tasks.js
   Part 3
====================================== */

// -------------------------------
// Search Tasks
// -------------------------------

function searchTasks() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return;

    const keyword =
        searchInput.value.toLowerCase().trim();

    const cards =
        document.querySelectorAll(".task-card");

    cards.forEach(card => {

        const title =
            card.querySelector(".task-title")
                .textContent
                .toLowerCase();

        if (title.includes(keyword)) {

            card.style.display = "flex";

        } else {

            card.style.display = "none";

        }

    });

}

// -------------------------------
// Today's Focus
// -------------------------------

function updateFocusList() {

    const focusList =
        document.getElementById("focusList");

    if (!focusList) return;

    focusList.innerHTML = "";

    const focusTasks = tasks
        .filter(task => !task.completed)
        .sort((a, b) => {

            const order = {
                High: 3,
                Medium: 2,
                Low: 1
            };

            return order[b.priority] - order[a.priority];

        })
        .slice(0, 3);

    if (focusTasks.length === 0) {

        focusList.innerHTML =
            "<li>No tasks for today 🎉</li>";

        return;

    }

    focusTasks.forEach(task => {

        const li =
            document.createElement("li");

        li.textContent =
            "🎯 " + task.text;

        focusList.appendChild(li);

    });

}

// -------------------------------
// Upcoming Deadlines
// -------------------------------

function updateUpcomingList() {

    const upcoming =
        document.getElementById("upcomingList");

    if (!upcoming) return;

    upcoming.innerHTML = "";

    const upcomingTasks = tasks

        .filter(task =>
            task.deadline !== "" &&
            !task.completed
        )

        .sort((a, b) =>
            new Date(a.deadline) -
            new Date(b.deadline)
        )

        .slice(0, 3);

    if (upcomingTasks.length === 0) {

        upcoming.innerHTML =
            "<li>No upcoming deadlines</li>";

        return;

    }

    upcomingTasks.forEach(task => {

        const li =
            document.createElement("li");

        li.innerHTML =
            `📅 ${task.deadline}<br>${task.text}`;

        upcoming.appendChild(li);

    });

}

// -------------------------------
// Task Counter
// -------------------------------

function updateTaskCount() {

    const counter =
        document.getElementById(
            "completedTasks"
        );

    if (!counter) return;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    counter.textContent =
        completed;

}

// -------------------------------
// Dashboard Progress
// -------------------------------

function updateProgress() {

    const fill =
        document.getElementById(
            "progressFill"
        );

    const text =
        document.getElementById(
            "progressText"
        );

    if (!fill || !text) return;

    if (tasks.length === 0) {

        fill.style.width = "0%";

        text.textContent = "0%";

        return;

    }

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const percent =
        Math.round(
            completed /
            tasks.length *
            100
        );

    fill.style.width =
        percent + "%";

    text.textContent =
        percent + "%";

}

// -------------------------------
// Search Listener
// -------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const search =
            document.getElementById(
                "searchInput"
            );

        if (search) {

            search.addEventListener(
                "input",
                searchTasks
            );

        }

    }
);
