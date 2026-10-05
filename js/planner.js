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

    if (
        !panel ||
        !schedule ||
        !totalTime
    ) {
        return;
    }


    const plannedTasks =
        getSmartPlan(
            tasks
        ).slice(
            0,
            6
        );


    panel.style.display = "block";


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

        return;

    }


    let currentMinutes =
        16 * 60;


    let totalMinutes = 0;


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


            const startMinutes =
                currentMinutes;


            const endMinutes =
                startMinutes +
                duration;


            const startTime =
                formatPlannerTimeOfDay(
                    startMinutes
                );


            const endTime =
                formatPlannerTimeOfDay(
                    endMinutes
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "build-day-item";


            item.innerHTML = `

                <div class="build-day-time">

                    ${startTime}
                    –
                    ${endTime}

                </div>


                <div class="build-day-task">

                    <strong>

                        ${index + 1}.
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

            `;


            schedule.appendChild(
                item
            );


            currentMinutes =
                endMinutes;


            totalMinutes +=
                duration;


            /*
             * Add a 15-minute break
             * between tasks.
             */

            if (
                index <
                plannedTasks.length - 1
            ) {

                const breakItem =
                    document.createElement(
                        "div"
                    );


                breakItem.className =
                    "build-day-break";


                breakItem.innerHTML = `

                    <span>
                        ☕
                    </span>

                    <span>
                        ${formatPlannerTimeOfDay(
                            currentMinutes
                        )}
                        –
                        ${formatPlannerTimeOfDay(
                            currentMinutes + 15
                        )}
                    </span>

                    <strong>
                        Break
                    </strong>

                `;


                schedule.appendChild(
                    breakItem
                );


                currentMinutes +=
                    15;

            }

        }
    );


    totalTime.textContent =
        `${formatPlannerTime(
            totalMinutes
        )} planned`;

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


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            buildMyDay
        );

    }
);
