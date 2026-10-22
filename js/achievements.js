
/* ======================================
   TASKY ACHIEVEMENTS
====================================== */

const TASKY_ACHIEVEMENT_COUNT_KEY = "tasky_lifetime_completed_v1";
const TASKY_UNLOCKED_ACHIEVEMENTS_KEY = "tasky_unlocked_achievements_v1";

const achievements = [
    { id: "first-task", title: "First Task", goal: 1 },
    { id: "task-master", title: "Task Master", goal: 25 },
    { id: "productivity-pro", title: "Productivity Pro", goal: 100 }
];

function getAchievementCount() {
    const value = Number(
        localStorage.getItem(TASKY_ACHIEVEMENT_COUNT_KEY)
    );

    return Number.isFinite(value) && value >= 0 ? value : 0;
}

function getUnlockedAchievements() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(TASKY_UNLOCKED_ACHIEVEMENTS_KEY) || "[]"
        );

        return new Set(Array.isArray(saved) ? saved : []);
    } catch (error) {
        console.error("Could not load achievements:", error);
        return new Set();
    }
}

/* Run once when Tasky starts */
function initializeAchievements() {
    if (localStorage.getItem(TASKY_ACHIEVEMENT_COUNT_KEY) === null) {
        const existingCompleted = Array.isArray(tasks)
            ? tasks.filter(task => task.completed).length
            : 0;

        localStorage.setItem(
            TASKY_ACHIEVEMENT_COUNT_KEY,
            String(existingCompleted)
        );
    }

        updateAchievements(false);
    renderAchievements();
}

/* Call only when a task changes from incomplete to complete */
function recordTaskCompletion() {
    const nextCount = getAchievementCount() + 1;

    localStorage.setItem(
        TASKY_ACHIEVEMENT_COUNT_KEY,
        String(nextCount)
    );

    updateAchievements(true);

   renderAchievements();
}

function updateAchievements(showUnlockToast = true) {
    const count = getAchievementCount();
    const unlocked = getUnlockedAchievements();
    let changed = false;

    achievements.forEach(achievement => {
        if (count < achievement.goal || unlocked.has(achievement.id)) {
            return;
        }

        unlocked.add(achievement.id);
        changed = true;

        if (showUnlockToast && typeof showToast === "function") {
            showToast(`🏆 Achievement unlocked: ${achievement.title}!`);
        }
    });

    if (changed) {
        localStorage.setItem(
            TASKY_UNLOCKED_ACHIEVEMENTS_KEY,
            JSON.stringify([...unlocked])
        );
    }

    return achievements.map(achievement => ({
        ...achievement,
        unlocked: unlocked.has(achievement.id),
        progress: Math.min(count, achievement.goal),
        total: count
    }));
}


function renderAchievements() {
    const list = document.getElementById("achievementsList");
    const completedElement = document.getElementById(
        "achievementCompletedCount"
    );
    const unlockedElement = document.getElementById(
        "achievementUnlockedCount"
    );

    if (!list || !completedElement || !unlockedElement) return;

    const count = getAchievementCount();
    const results = updateAchievements(false);
    const unlockedCount = results.filter(item => item.unlocked).length;

    completedElement.textContent = count;
    unlockedElement.textContent = `${unlockedCount}/${results.length}`;

    list.replaceChildren();

    results.forEach(achievement => {
        const card = document.createElement("article");
        card.className = achievement.unlocked
            ? "achievement-card unlocked"
            : "achievement-card locked";

        const title = document.createElement("h3");
        title.textContent = achievement.title;

        const status = document.createElement("p");
        status.textContent = achievement.unlocked
            ? "Unlocked!"
            : `${achievement.progress} / ${achievement.goal} tasks completed`;

        const progress = document.createElement("progress");
        progress.max = achievement.goal;
        progress.value = achievement.progress;
        progress.setAttribute(
            "aria-label",
            `${achievement.title} progress`
        );

        card.append(title, status, progress);
        list.appendChild(card);
    });
}

