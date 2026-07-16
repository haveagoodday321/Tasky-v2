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
