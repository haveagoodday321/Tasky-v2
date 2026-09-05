// ========================================
// TASKY V2 — ANALYTICS
// ========================================

function updateAnalytics() {

    // Make sure tasks exists
    if (!Array.isArray(tasks)) {
        return;
    }

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending =
        tasks.filter(task => !task.completed).length;

    // ----------------------------------------
    // Overall completion rate
    // ----------------------------------------

    const completionRate =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);


    // ----------------------------------------
    // Basic statistics
    // ----------------------------------------

    const totalElement =
        document.getElementById("totalTasksStat");

    const completedElement =
        document.getElementById("completedTasksStat");

    const pendingElement =
        document.getElementById("pendingTasksStat");

    const rateElement =
        document.getElementById("completionRateStat");


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (rateElement) {
        rateElement.textContent =
            `${completionRate}%`;
    }


    // ----------------------------------------
    // Weekly summary
    // ----------------------------------------

    const summary =
        document.getElementById("weeklySummary");

    if (summary) {
        summary.textContent =
            `${completed} of ${total} tasks completed.`;
    }


    // ----------------------------------------
    // Priority statistics
    // ----------------------------------------

    const high =
        tasks.filter(
            task => task.priority === "high"
        ).length;

    const medium =
        tasks.filter(
            task => task.priority === "medium"
        ).length;

    const low =
        tasks.filter(
            task => task.priority === "low"
        ).length;


    const highElement =
        document.getElementById("highPriorityStat");

    const mediumElement =
        document.getElementById("mediumPriorityStat");

    const lowElement =
        document.getElementById("lowPriorityStat");


    if (highElement) {
        highElement.textContent = high;
    }

    if (mediumElement) {
        mediumElement.textContent = medium;
    }

    if (lowElement) {
        lowElement.textContent = low;
    }

    // ----------------------------------------
    // Deadline statistics
    // ----------------------------------------

    const today = new Date();

    // Remove the time so we compare dates only
    today.setHours(0, 0, 0, 0);

    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;
    let noDeadline = 0;

    tasks.forEach(task => {

        // Tasks without deadlines
        if (!task.deadline) {
            noDeadline++;
            return;
        }

        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);

        // Completed tasks are not counted as overdue
        if (task.completed) {
            return;
        }

        // Deadline has passed
        if (deadline < today) {
            overdue++;
        }

        // Deadline is today
        else if (deadline.getTime() === today.getTime()) {
            dueToday++;
        }

        // Deadline is in the future
        else if (deadline > today) {
            upcoming++;
        }
    });


    const overdueElement =
        document.getElementById("overdueTasksStat");

    const todayElement =
        document.getElementById("todayTasksStat");

    const upcomingElement =
        document.getElementById("upcomingTasksStat");

    const noDeadlineElement =
        document.getElementById("noDeadlineTasksStat");


    if (overdueElement) {
        overdueElement.textContent = overdue;
    }

    if (todayElement) {
        todayElement.textContent = dueToday;
    }

    if (upcomingElement) {
        upcomingElement.textContent = upcoming;
    }

    if (noDeadlineElement) {
        noDeadlineElement.textContent = noDeadline;
    }
}
