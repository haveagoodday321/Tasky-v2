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
}
