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
            task => task.priority === "High"
        ).length;

    const medium =
        tasks.filter(
            task => task.priority === "Medium"
        ).length;

    const low =
        tasks.filter(
            task => task.priority === "Low"
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

        // ----------------------------------------
    // Productivity Insight
    // ----------------------------------------

    const scoreElement =
        document.getElementById("productivityScore");

    const insightElement =
        document.getElementById("productivityInsight");


    if (scoreElement) {
        scoreElement.textContent =
            `${completionRate}%`;
    }


    if (insightElement) {

        if (total === 0) {

            insightElement.textContent =
                "Add some tasks to start tracking your productivity.";

        }

        else if (overdue > 0) {

            insightElement.textContent =
                `⚠️ You have ${overdue} overdue ${
                    overdue === 1 ? "task" : "tasks"
                }. Try completing these first.`;

        }

        else if (completionRate === 100) {

            insightElement.textContent =
                "🏆 Excellent! You've completed every task.";

        }

        else if (completionRate >= 75) {

            insightElement.textContent =
                "🔥 Great productivity! You're completing most of your tasks.";

        }

        else if (completionRate >= 50) {

            insightElement.textContent =
                "💪 You're making good progress. Keep pushing.";

        }

        else {

            insightElement.textContent =
                "🎯 Focus on completing a few important tasks first.";

        }
    }
    // ----------------------------------------
    // 7-Day Productivity History
    // ----------------------------------------

    const weeklyChart =
        document.getElementById("weeklyChart");

    if (weeklyChart) {

        weeklyChart.innerHTML = "";

        const today = new Date();

        const days = [];

        for (let i = 6; i >= 0; i--) {

            const date = new Date(today);

            date.setDate(
                today.getDate() - i
            );

            date.setHours(0, 0, 0, 0);

            days.push(date);
        }


        days.forEach(date => {

            const nextDay =
                new Date(date);

            nextDay.setDate(
                date.getDate() + 1
            );


            const completedCount =
                tasks.filter(task => {

                    if (!task.completedAt) {
                        return false;
                    }

                    const completedDate =
                        new Date(task.completedAt);

                    return (
                        completedDate >= date &&
                        completedDate < nextDay
                    );

                }).length;


            const dayContainer =
                document.createElement("div");

            dayContainer.className =
                "weekly-chart-day";


            const bar =
                document.createElement("div");

            bar.className =
                "weekly-chart-bar";


            // Give the bar a visible height
            // even when the count is 0

            const barHeight =
                completedCount === 0
                    ? 5
                    : Math.min(
                        100,
                        completedCount * 20
                    );

            bar.style.height =
                `${barHeight}%`;


            const count =
                document.createElement("strong");

            count.textContent =
                completedCount;


            const label =
                document.createElement("span");

            label.textContent =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


            dayContainer.appendChild(bar);

            dayContainer.appendChild(count);

            dayContainer.appendChild(label);

            weeklyChart.appendChild(
                dayContainer
            );

        });

    }
}
