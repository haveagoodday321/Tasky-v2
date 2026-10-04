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
