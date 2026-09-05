/* ======================================
   TASKY V2
   analytics.js
   Statistics System
====================================== */

function updateAnalytics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        tasks.filter(
            task =>
                !task.completed
        ).length;


    const completionRate =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    const totalElement =
        document.getElementById(
            "totalTasksStat"
        );


    const completedElement =
        document.getElementById(
            "completedTasksStat"
        );


    const pendingElement =
        document.getElementById(
            "pendingTasksStat"
        );


    const rateElement =
        document.getElementById(
            "completionRateStat"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (rateElement) {

        rateElement.textContent =
            `${completionRate}%`;

    }


    const summary =
        document.getElementById(
            "weeklySummary"
        );


    if (summary) {

        summary.textContent =
            `${completed} of ${total} tasks completed.`;

    }

}
