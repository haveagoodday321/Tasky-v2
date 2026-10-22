/* ======================================
   TASKY REMINDER ENGINE
====================================== */

const TASKY_NOTIFIED_REMINDERS_KEY = "tasky_notified_reminders_v1";
let taskyReminderInterval = null;

/* Read reminder IDs already handled by this browser */
function getHandledTaskyReminders() {
    try {
        const saved = localStorage.getItem(
            TASKY_NOTIFIED_REMINDERS_KEY
        );

        return new Set(saved ? JSON.parse(saved) : []);
    } catch (error) {
        console.error("Could not read reminder history:", error);
        return new Set();
    }
}

/* Save reminder history to prevent duplicate notifications */
function saveHandledTaskyReminders(handled) {
    try {
        localStorage.setItem(
            TASKY_NOTIFIED_REMINDERS_KEY,
            JSON.stringify([...handled])
        );
    } catch (error) {
        console.error("Could not save reminder history:", error);
    }
}

/* Ask permission only after the user clicks a button */
async function enableTaskyNotifications() {
    if (!("Notification" in window)) {
        showToast("This browser does not support notifications.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            showToast("Notifications enabled!");
            checkTaskyReminders();
        } else {
            showToast(
                "Notifications weren't enabled. Check your browser permissions."
            );
        }
    } catch (error) {
        console.error("Notification permission error:", error);
        showToast("Could not enable notifications.");
    }
}

/* Send one notification for a due reminder */
function sendTaskyReminder(task) {
    const message = `Tasky reminder: ${task.text}`;

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        try {
            new Notification("Tasky", {
                body: message,
                tag: `tasky-${task.id}`
            });
            return;
        } catch (error) {
            console.error("Could not display notification:", error);
        }
    }

    if (typeof showToast === "function") {
        showToast(message);
    }
}

/* Check tasks for reminders that are due */
function checkTaskyReminders() {
    if (typeof tasks === "undefined" || !Array.isArray(tasks)) {
        return;
    }

    const now = Date.now();
    const handled = getHandledTaskyReminders();
    let historyChanged = false;

    tasks.forEach(task => {
        if (
            !task ||
            task.completed ||
            !task.reminderAt
        ) {
            return;
        }

        const reminderTime = new Date(task.reminderAt).getTime();

        if (!Number.isFinite(reminderTime)) {
            return;
        }

        const reminderKey = `${task.id}:${task.reminderAt}`;

        if (handled.has(reminderKey)) {
            return;
        }

        // Avoid surprising notifications for reminders over 12 hours late.
        const twelveHours = 12 * 60 * 60 * 1000;

        if (reminderTime <= now && now - reminderTime <= twelveHours) {
            sendTaskyReminder(task);
            handled.add(reminderKey);
            historyChanged = true;
        } else if (reminderTime < now - twelveHours) {
            // Mark very old reminders as handled without notifying.
            handled.add(reminderKey);
            historyChanged = true;
        }
    });

    if (historyChanged) {
        saveHandledTaskyReminders(handled);
    }
}

/* Start checking reminders while Tasky is open */
function initializeReminderEngine() {
    if (taskyReminderInterval !== null) {
        clearInterval(taskyReminderInterval);
    }

    const enableButton = document.getElementById(
        "enableTaskyNotifications"
    );

    if (enableButton) {
        enableButton.addEventListener(
            "click",
            enableTaskyNotifications
        );
    }

    checkTaskyReminders();

    taskyReminderInterval = setInterval(
        checkTaskyReminders,
        15000
    );
    }


/* Recheck reminders when the user returns to Tasky */
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        checkTaskyReminders();
    }
});

/* Recheck reminders when the browser window regains focus */
window.addEventListener("focus", () => {
    checkTaskyReminders();
});

