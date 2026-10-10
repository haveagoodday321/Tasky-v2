/* ======================================
   TASKY SMART PLANNER
   Version 1
====================================== */


/* ======================================
   PLANNER CONFIGURATION
====================================== */

const PLANNER_CONFIG = {

    overdueWeight: 100,

    todayWeight: 80,

    tomorrowWeight: 60,

    highPriorityWeight: 50,

    mediumPriorityWeight: 30,

    lowPriorityWeight: 10,

    shortTaskBonus: 5,

    subtaskBonus: 5

};


/* ======================================
   DATE HELPERS
====================================== */

function plannerStartOfDay(date = new Date()) {

    const result =
        new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;

}


function plannerDaysUntil(
    deadline
) {

    if (!deadline) {

        return null;

    }


    const today =
        plannerStartOfDay();

    const target =
        plannerStartOfDay(
            new Date(deadline)
        );


    return Math.round(
        (
            target - today
        ) /
        (1000 * 60 * 60 * 24)
    );

}


/* ======================================
   DEADLINE SCORE
====================================== */

function getDeadlineScore(task) {

    const days =
        plannerDaysUntil(
            task.deadline
        );


    if (days === null) {

        return 0;

    }


    if (days < 0) {

        return PLANNER_CONFIG.overdueWeight;

    }


    if (days === 0) {

        return PLANNER_CONFIG.todayWeight;

    }


    if (days === 1) {

        return PLANNER_CONFIG.tomorrowWeight;

    }


    if (days <= 3) {

        return 40;

    }


    if (days <= 7) {

        return 20;

    }


    return 5;

}


/* ======================================
   PRIORITY SCORE
====================================== */

function getPriorityScore(task) {

    const priority =
        (
            task.priority ||
            "Medium"
        ).toLowerCase();


    if (priority === "high") {

        return PLANNER_CONFIG.highPriorityWeight;

    }


    if (priority === "medium") {

        return PLANNER_CONFIG.mediumPriorityWeight;

    }


    return PLANNER_CONFIG.lowPriorityWeight;

}


/* ======================================
   DURATION SCORE
====================================== */

function getDurationScore(task) {

    const duration =
        Number(
            task.duration
        ) || 60;


    /*
       Short tasks receive a small bonus.
       This helps Tasky find quick wins
       when priorities are otherwise similar.
    */

    if (duration <= 30) {

        return PLANNER_CONFIG.shortTaskBonus;

    }


    return 0;

}


/* ======================================
   SUBTASK SCORE
====================================== */

function getSubtaskScore(task) {

    if (
        !Array.isArray(
            task.subtasks
        )
    ) {

        return 0;

    }


    const incomplete =
        task.subtasks.filter(
            subtask =>
                !subtask.completed
        ).length;


    if (incomplete === 0) {

        return 0;

    }


    return Math.min(
        incomplete *
            PLANNER_CONFIG.subtaskBonus,
        20
    );

}


/* ======================================
   TOTAL TASK SCORE
====================================== */

function calculatePlannerScore(task) {

    if (!task) {

        return 0;

    }


    if (task.completed) {

        return -Infinity;

    }


    const deadlineScore =
        getDeadlineScore(task);


    const priorityScore =
        getPriorityScore(task);


    const durationScore =
        getDurationScore(task);


    const subtaskScore =
        getSubtaskScore(task);


    return (
        deadlineScore +
        priorityScore +
        durationScore +
        subtaskScore
    );

}


/* ======================================
   SCORE ALL TASKS
====================================== */

function scoreTasksForPlanner(
    taskList = []
) {

    return taskList

        .filter(
            task =>
                !task.completed
        )

        .map(task => ({

            task: task,

            score:
                calculatePlannerScore(
                    task
                )

        }))

        .sort(
            (a, b) =>
                b.score -
                a.score
        );

}


/* ======================================
   GET TODAY'S PLAN
====================================== */

function getSmartPlan(
    taskList = []
) {

    const scored =
        scoreTasksForPlanner(
            taskList
        );


    return scored.map(
        item => item.task
    );

}


/* ======================================
   GET TOP RECOMMENDATIONS
====================================== */

function getTopPlannedTasks(
    taskList = [],
    limit = 5
) {

    return getSmartPlan(
        taskList
    ).slice(
        0,
        limit
    );

}


/* ======================================
   PLANNER REASON
====================================== */

function getPlannerReason(task) {

    if (!task) {

        return "";

    }


    const reasons = [];


    const days =
        plannerDaysUntil(
            task.deadline
        );


    if (days !== null) {

        if (days < 0) {

            reasons.push(
                "Overdue"
            );

        } else if (days === 0) {

            reasons.push(
                "Due today"
            );

        } else if (days === 1) {

            reasons.push(
                "Due tomorrow"
            );

        }

    }


    if (
        (
            task.priority ||
            ""
        ).toLowerCase()
        ===
        "high"
    ) {

        reasons.push(
            "High priority"
        );

    }


    if (
        Array.isArray(
            task.subtasks
        )
        &&
        task.subtasks.some(
            subtask =>
                !subtask.completed
        )
    ) {

        reasons.push(
            "Has unfinished steps"
        );

    }


    if (
        reasons.length === 0
    ) {

        reasons.push(
            "Good next task"
        );

    }


    return reasons.join(
        " • "
    );

      }

/* ======================================
   SMART PLANNER UI
====================================== */


function formatPlannerTime(
    minutes
) {

    const value =
        Number(minutes) || 0;


    if (value < 60) {

        return `${value}m`;

    }


    const hours =
        Math.floor(
            value / 60
        );


    const remaining =
        value % 60;


    if (remaining === 0) {

        return `${hours}h`;

    }


    return `${hours}h ${remaining}m`;

}


/* ======================================
   RENDER PLANNER
====================================== */

function renderSmartPlanner() {

    const list =
        document.getElementById(
            "plannerTaskList"
        );


    if (!list) return;


    const plannedTasks =
        getSmartPlan(
            tasks
        );


    const topTasks =
        plannedTasks.slice(
            0,
            10
        );


    /* SUMMARY */

    const count =
        document.getElementById(
            "plannerTaskCount"
        );


    const totalTime =
        document.getElementById(
            "plannerTimeTotal"
        );


    const highPriority =
        document.getElementById(
            "plannerHighPriority"
        );


    if (count) {

        count.textContent =
            topTasks.length;

    }


    const minutes =
        topTasks.reduce(
            (
                total,
                task
            ) =>
                total +
                (
                    Number(
                        task.duration
                    ) || 60
                ),
            0
        );


    if (totalTime) {

        totalTime.textContent =
            formatPlannerTime(
                minutes
            );

    }


    const highCount =
        topTasks.filter(
            task =>
                (
                    task.priority ||
                    ""
                ).toLowerCase()
                ===
                "high"
        ).length;


    if (highPriority) {

        highPriority.textContent =
            highCount;

    }


    /* EMPTY */

    if (
        topTasks.length === 0
    ) {

        list.innerHTML = `

            <div class="planner-empty">

                <div class="planner-empty-icon">
                    🎉
                </div>

                <p>
                    You're all caught up!
                    No unfinished tasks need planning.
                </p>

            </div>

        `;


        renderPlannerAttention(
            []
        );

        renderPlannerQuickWin(
            []
        );

        return;

    }


    /* TASKS */

    list.innerHTML = "";


    topTasks.forEach(
        (
            task,
            index
        ) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "planner-task";


            const reason =
                getPlannerReason(
                    task
                );


            const duration =
                formatPlannerTime(
                    task.duration
                );


            const priority =
                (
                    task.priority ||
                    "Medium"
                );


            const priorityIcon =
                priority === "High"
                    ? "🔴"
                    : priority === "Medium"
                        ? "🟠"
                        : "🟢";


            item.innerHTML = `

                <div
                    class="planner-task-number">

                    ${index + 1}

                </div>


                <div
                    class="planner-task-content">

                    <span
                        class="planner-task-title">

                        ${escapeHTML(
                            task.text
                        )}

                    </span>


                    <div
                        class="planner-task-meta">

                        <span>
                            ${priorityIcon}
                            ${escapeHTML(
                                priority
                            )}
                        </span>


                        <span>
                            ⏱️ ${duration}
                        </span>


                        ${
                            task.category
                                ? `
                                    <span>
                                        📂
                                        ${escapeHTML(
                                            task.category
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <small
                        class="planner-task-reason">

                        ${escapeHTML(
                            reason
                        )}

                    </small>

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );


    renderPlannerAttention(
        topTasks
    );


    renderPlannerQuickWin(
        topTasks
    );

}


/* ======================================
   ATTENTION MESSAGE
====================================== */

function renderPlannerAttention(
    plannedTasks
) {

    const container =
        document.getElementById(
            "plannerAttention"
        );


    if (!container) return;


    const urgent =
        plannedTasks.filter(
            task => {

                const days =
                    plannerDaysUntil(
                        task.deadline
                    );


                return (
                    days !== null &&
                    days <= 1 &&
                    !task.completed
                );

            }
        );


    if (
        urgent.length === 0
    ) {

        container.innerHTML = "";

        return;

    }


    container.innerHTML = `

        <div class="planner-alert">

            <span class="planner-alert-icon">
                ⚠️
            </span>

            <div>

                <strong>
                    ${urgent.length}
                    task${
                        urgent.length === 1
                            ? ""
                            : "s"
                    }
                    need attention soon.
                </strong>

                <p>
                    Tasky has moved these tasks
                    higher in your plan because
                    their deadlines are approaching.
                </p>

            </div>

        </div>

    `;

}


/* ======================================
   QUICK WIN
====================================== */

function renderPlannerQuickWin(
    plannedTasks
) {

    const container =
        document.getElementById(
            "plannerQuickWin"
        );


    if (!container) return;


    const quickWin =
        plannedTasks
            .filter(
                task =>
                    (
                        Number(
                            task.duration
                        ) || 60
                    ) <= 30
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    (
                        Number(
                            a.duration
                        ) || 60
                    ) -
                    (
                        Number(
                            b.duration
                        ) || 60
                    )
            )[0];


    if (!quickWin) {

        container.innerHTML = "";

        return;

    }


    container.innerHTML = `

        <div
            class="planner-quick-win-content">

            <div>

                <h3>
                    ⚡ Quick Win
                </h3>

                <p>
                    ${escapeHTML(
                        quickWin.text
                    )}
                    ·
                    ${
                        formatPlannerTime(
                            quickWin.duration
                        )
                    }
                </p>

            </div>


            <span
                class="planner-quick-win-badge">

                Easy progress

            </span>

        </div>

    `;

}


/* ======================================
   PLANNER BUTTON
====================================== */

function openSmartPlanner() {

    if (
        typeof showPage ===
        "function"
    ) {

        showPage(
            "plannerSection"
        );

    }

}


/* ======================================
   AUTO UPDATE
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderSmartPlanner();

    }
);

/* ======================================
   BUILD MY DAY
====================================== */


/* ======================================
   STRUCTURED DAILY SCHEDULE
====================================== */

let currentBuildDayBlocks = [];


function getLocalDateKey(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function buildMyDay() {

    const panel =
        document.getElementById(
            "buildMyDayPanel"
        );

    const schedule =
        document.getElementById(
            "buildDaySchedule"
        );

    const totalTime =
        document.getElementById(
            "buildDayTotalTime"
        );

    const startInput =
        document.getElementById(
            "dayStartTime"
        );

    const endInput =
        document.getElementById(
            "dayEndTime"
        );

    const breakInput =
        document.getElementById(
            "breakDuration"
        );

    const maxTasksInput =
        document.getElementById(
            "maxTasksPerDay"
        );


    if (
        !panel ||
        !schedule ||
        !totalTime ||
        !startInput ||
        !endInput ||
        !breakInput ||
        !maxTasksInput
    ) {

        return;

    }


    /* ==================================
       READ SETTINGS
    ================================== */

    const startParts =
        startInput.value
            .split(":")
            .map(Number);

    const endParts =
        endInput.value
            .split(":")
            .map(Number);


    let currentMinutes =
        (
            startParts[0] * 60
        ) +
        startParts[1];


    const endMinutes =
        (
            endParts[0] * 60
        ) +
        endParts[1];


    const breakMinutes =
        Number(
            breakInput.value
        );


    const maxTasks =
        Number(
            maxTasksInput.value
        );


    /* ==================================
       VALIDATE TIME
    ================================== */

    if (
        endMinutes <=
        currentMinutes
    ) {

        panel.style.display =
            "block";


        schedule.innerHTML = `

            <div class="build-day-empty">

                <div>
                    ⚠️
                </div>

                <p>
                    Your end time must be
                    later than your start time.
                </p>

            </div>

        `;


        totalTime.textContent =
            "Invalid schedule";

        return;

    }


    /* ==================================
       GET TASKS
    ================================== */

    const excludedTaskIds =
    getBuildDayExcludedTasks();

const availableTasks =
    tasks.filter(
        task =>
            !excludedTaskIds.includes(
                String(task.id)
            ) &&
            !task.completed
    );

const plannedTasks =
    getSmartPlan(
        availableTasks
    ).slice(
        0,
        maxTasks
    );


    panel.style.display =
        "block";


    if (
        plannedTasks.length === 0
    ) {

        schedule.innerHTML = `

            <div class="build-day-empty">

                <div>
                    🎉
                </div>

                <p>
                    You have no unfinished tasks
                    to schedule.
                </p>

            </div>

        `;


        totalTime.textContent =
            "0m planned";

       saveBuildDayState();

        return;

    }


    /* ==================================
       BUILD SCHEDULE
    ================================== */

    
let totalTaskMinutes = 0;

let scheduledTasks = 0;

currentBuildDayBlocks = [];

schedule.innerHTML = "";
   
    plannedTasks.forEach(
        (
            task,
            index
        ) => {

            const duration =
                Number(
                    task.duration
                ) || 60;


            /*
             * Check whether the task
             * fits inside the user's day.
             */

            const remainingMinutes =
                endMinutes -
                currentMinutes;


            const requiredMinutes =
                duration +
                (
                    scheduledTasks > 0
                        ? breakMinutes
                        : 0
                );


            if (
                requiredMinutes >
                remainingMinutes
            ) {

                return;

            }


            /*
             * Add break before
             * every task except first.
             */

            if (
                scheduledTasks > 0
            ) {


const breakStart =
    currentMinutes;

const breakEnd =
    currentMinutes + breakMinutes;


currentBuildDayBlocks.push({

    id:
        `break-${getLocalDateKey()}-${scheduledTasks}`,

    type:
        "break",

    date:
        getLocalDateKey(),

    startTime:
        formatMinutesAs24Hour(breakStart),

    duration:
        breakMinutes,

    order:
        currentBuildDayBlocks.length

});


const breakItem =
    document.createElement("div");


breakItem.className =
    "build-day-break";
               


                breakItem.innerHTML = `

                    <span>
                        ☕
                    </span>

                    <span>
                        ${formatPlannerTimeOfDay(
                            breakStart
                        )}
                        –
                        ${formatPlannerTimeOfDay(
                            breakEnd
                        )}
                    </span>

                    <strong>
                        Break
                    </strong>

                `;


                schedule.appendChild(
                    breakItem
                );


                currentMinutes =
                    breakEnd;

            }


            
const startTime =
    currentMinutes;

const taskEnd =
    startTime + duration;


currentBuildDayBlocks.push({

    id:
        `task-${String(task.id)}`,

    type:
        "task",

    taskId:
        String(task.id),

    title:
        task.text,

    date:
        getLocalDateKey(),

    startTime:
        formatMinutesAs24Hour(startTime),

    duration:
        duration,

    endTime:
        formatMinutesAs24Hour(taskEnd),

    order:
        currentBuildDayBlocks.length

});
           


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "build-day-item";


   item.innerHTML = `

    <div
        class="build-day-time">

        <span>
            ${formatPlannerTimeOfDay(
                startTime
            )}
            –
            ${formatPlannerTimeOfDay(
                taskEnd
            )}
        </span>

        <button
            class="build-day-edit-btn"
            type="button"
            data-task-id="${task.id}">

            ✏️

        </button>

    </div>


    <div
        class="build-day-task">

        <strong>

            ${scheduledTasks + 1}.
            ${escapeHTML(
                task.text
            )}

        </strong>


        <span>

            ⏱️
            ${formatPlannerTime(
                duration
            )}

        </span>

    </div>


    <button
        class="build-day-remove-btn"
        type="button"
        data-task-id="${task.id}">

        ✕

    </button>

`;


            schedule.appendChild(
                item
            );


            currentMinutes =
                taskEnd;


            totalTaskMinutes +=
                duration;


            scheduledTasks++;

        }
    );


    /* ==================================
       RESULT
    ================================== */

    if (
        scheduledTasks === 0
    ) {

        schedule.innerHTML = `

            <div class="build-day-empty">

                <div>
                    ⏳
                </div>

                <p>
                    Your available time is
                    too short for the selected
                    tasks.
                </p>

            </div>

        `;


        totalTime.textContent =
            "No tasks scheduled";

       saveBuildDayState();

        return;

    }


    totalTime.textContent =
        `${formatPlannerTime(
            totalTaskMinutes
        )} planned`;

   saveBuildDayState();

}


/* ======================================
   BUILD DAY PERSISTENCE
====================================== */

const BUILD_DAY_STORAGE_KEY =
    "taskyDailyPlan";

const BUILD_DAY_EXCLUDED_KEY =
    "taskyDailyPlanExcludedTasks";


function getBuildDayExcludedTasks() {

    try {

        const saved =
            localStorage.getItem(
                BUILD_DAY_EXCLUDED_KEY
            );

        const ids =
            saved
                ? JSON.parse(saved)
                : [];

        return Array.isArray(ids)
            ? ids.map(String)
            : [];

    } catch (error) {

        console.error(
            "Could not read excluded tasks:",
            error
        );

        return [];

    }

}


function saveBuildDayState() {

    const schedule =
        document.getElementById(
            "buildDaySchedule"
        );

    const totalTime =
        document.getElementById(
            "buildDayTotalTime"
        );

    const status =
        document.getElementById(
            "buildDaySaveStatus"
        );

    const startInput =
        document.getElementById(
            "dayStartTime"
        );

    const endInput =
        document.getElementById(
            "dayEndTime"
        );

    const breakInput =
        document.getElementById(
            "breakDuration"
        );

    const maxTasksInput =
        document.getElementById(
            "maxTasksPerDay"
        );


    if (
        !schedule ||
        !totalTime ||
        !startInput ||
        !endInput ||
        !breakInput ||
        !maxTasksInput
    ) {

        return false;

    }



const plan = {

    version: 2,

    date:
        getLocalDateKey(),

    updatedAt:
        new Date().toISOString(),

    settings: {

        startTime:
            startInput.value,

        endTime:
            endInput.value,

        breakDuration:
            breakInput.value,

        maxTasks:
            maxTasksInput.value

    },

    excludedTaskIds:
        getBuildDayExcludedTasks(),

    scheduleBlocks:
        currentBuildDayBlocks.map(
            block => ({ ...block })
        ),

    scheduleHTML:
        schedule.innerHTML,

    totalTime:
        totalTime.textContent

};
   


    try {

        localStorage.setItem(
            BUILD_DAY_STORAGE_KEY,
            JSON.stringify(plan)
        );


        if (status) {

            status.textContent =
                "✓ Saved on this device";

        }

        return true;

    } catch (error) {

        console.error(
            "Could not save daily plan:",
            error
        );


        if (status) {

            status.textContent =
                "⚠️ Could not save plan";

        }

        return false;

    }

}


function restoreBuildDayState() {

    let plan;

    try {

        const saved =
            localStorage.getItem(
                BUILD_DAY_STORAGE_KEY
            );

        if (!saved) {
            return;
        }

        plan = JSON.parse(saved);

    } catch (error) {

        console.error(
            "Could not restore daily plan:",
            error
        );

        return;

    }


    if (
        !plan ||
        !plan.settings
    ) {

        return;

    }


    const panel =
        document.getElementById(
            "buildMyDayPanel"
        );

    const schedule =
        document.getElementById(
            "buildDaySchedule"
        );

    const totalTime =
        document.getElementById(
            "buildDayTotalTime"
        );

    const status =
        document.getElementById(
            "buildDaySaveStatus"
        );


    if (
        !panel ||
        !schedule ||
        !totalTime
    ) {

        return;

    }


    const startInput =
        document.getElementById(
            "dayStartTime"
        );

    const endInput =
        document.getElementById(
            "dayEndTime"
        );

    const breakInput =
        document.getElementById(
            "breakDuration"
        );

    const maxTasksInput =
        document.getElementById(
            "maxTasksPerDay"
        );


    if (startInput && plan.settings.startTime) {

        startInput.value =
            plan.settings.startTime;

    }

    if (endInput && plan.settings.endTime) {

        endInput.value =
            plan.settings.endTime;

    }

    if (breakInput && plan.settings.breakDuration) {

        breakInput.value =
            plan.settings.breakDuration;

    }

    if (maxTasksInput && plan.settings.maxTasks) {

        maxTasksInput.value =
            plan.settings.maxTasks;

    }


    const today =
        new Date()
            .toLocaleDateString("en-CA");


    /*
     * Restore the saved plan only for
     * the day on which it was created.
     */

    if (plan.date !== today) {

        if (status) {

            status.textContent =
                "New day — build today's plan";

        }

        return;

    }


    try {

        localStorage.setItem(
            BUILD_DAY_EXCLUDED_KEY,
            JSON.stringify(
                plan.excludedTaskIds || []
            )
        );

    } catch (error) {

        console.error(
            "Could not restore excluded tasks:",
            error
        );

    }


    
schedule.innerHTML =
    plan.scheduleHTML || "";


currentBuildDayBlocks =
    Array.isArray(plan.scheduleBlocks)
        ? plan.scheduleBlocks.map(
            block => ({ ...block })
        )
        : [];


totalTime.textContent =
    plan.totalTime || "0m planned";
   


    panel.style.display =
        "block";


    if (status) {

        status.textContent =
            "✓ Restored saved plan";

    }

}


/* ======================================
   REBUILD DAILY PLAN
====================================== */

function rebuildBuildMyDay() {

    try {

        localStorage.removeItem(
            BUILD_DAY_EXCLUDED_KEY
        );

    } catch (error) {

        console.error(
            "Could not reset excluded tasks:",
            error
        );

    }


    buildMyDay();

}


/* ======================================
   EDIT BUILD-DAY TASK
====================================== */

function editBuildDayTask(
    taskId
) {

    const task =
        tasks.find(
            item =>
                String(item.id) ===
                String(taskId)
        );


    if (!task) {
        return;
    }


    const newDuration =
        prompt(
            `How many minutes should "${task.text}" take?`,
            task.duration || 60
        );


    if (
        newDuration === null
    ) {
        return;
    }


    const duration =
        Number(
            newDuration
        );


    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        alert(
            "Please enter a valid duration."
        );

        return;

    }


    task.duration =
        Math.round(
            duration
        );


    localStorage.setItem(
        "tasks",
        JSON.stringify(
            tasks
        )
    );


    buildMyDay();

}


/* ======================================
   REMOVE BUILD-DAY TASK
====================================== */


function removeBuildDayTask(taskId) {

    const excludedTaskIds =
        getBuildDayExcludedTasks();


    const id =
        String(taskId);


    if (
        !excludedTaskIds.includes(id)
    ) {

        excludedTaskIds.push(id);

    }


    try {

        localStorage.setItem(
            BUILD_DAY_EXCLUDED_KEY,
            JSON.stringify(
                excludedTaskIds
            )
        );

    } catch (error) {

        console.error(
            "Could not save removed task:",
            error
        );

        return;

    }


    buildMyDay();

}


/* ======================================
   24-HOUR TIME CONVERSION
====================================== */

function formatMinutesAs24Hour(totalMinutes) {

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );

}


/* ======================================
   TIME FORMATTER
====================================== */

function formatPlannerTimeOfDay(
    totalMinutes
) {

    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;


    const displayHour =
        hours > 12
            ? hours - 12
            : hours;


    const suffix =
        hours >= 12
            ? "PM"
            : "AM";


    return `${displayHour}:${String(
        minutes
    ).padStart(
        2,
        "0"
    )} ${suffix}`;

}


/* ======================================
   BUILD MY DAY BUTTON
====================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const button =
            document.getElementById(
                "buildMyDayBtn"
            );

        const rebuildButton =
            document.getElementById(
                "rebuildDayBtn"
            );

        const saveButton =
            document.getElementById(
                "saveBuildDayBtn"
            );


        if (button) {

            button.addEventListener(
                "click",
                () => {

                    document.getElementById(
                        "buildMyDayPanel"
                    ).style.display = "block";

                    buildMyDay();

                }
            );

        }


        if (rebuildButton) {

            rebuildButton.addEventListener(
                "click",
                rebuildBuildMyDay
            );

        }


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveBuildDayState
            );

        }


        restoreBuildDayState();

    }
);


document.addEventListener(
    "click",
    function (event) {

        const editButton =
            event.target.closest(
                ".build-day-edit-btn"
            );


        const removeButton =
            event.target.closest(
                ".build-day-remove-btn"
            );


        if (editButton) {

            editBuildDayTask(
                editButton.dataset.taskId
            );

        }


        if (removeButton) {

            removeBuildDayTask(
                removeButton.dataset.taskId
            );

        }

    }
);

