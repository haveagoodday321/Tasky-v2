
/* ======================================
   TASKY REMINDER ENGINE
====================================== */

const TASKY_NOTIFIED_REMINDERS_KEY =
    "tasky_notified_reminders_v1";

const TASKY_NOTIFICATIONS_ENABLED_KEY =
    "tasky_notifications_enabled_v1";

let taskyReminderInterval = null;

/* Read Tasky's notification preference */
function areTaskyNotificationsEnabled() {
    return localStorage.getItem(
        TASKY_NOTIFICATIONS_ENABLED_KEY
    ) === "true";
}

/* Save Tasky's notification preference */
function setTaskyNotificationsEnabled(enabled) {
    localStorage.setItem(
        TASKY_NOTIFICATIONS_ENABLED_KEY,
        String(enabled)
    );

    updateTaskyNotificationButton();
}

/* Update the button to match the current state */
function updateTaskyNotificationButton() {
    const button = document.getElementById(
        "enableTaskyNotifications"
    );

    if (!button) return;

    const enabled = areTaskyNotificationsEnabled();
    const supported = "Notification" in window;
    const permission = supported
        ? Notification.permission
        : "unsupported";

    button.disabled = false;
    button.setAttribute(
        "aria-pressed",
        String(enabled)
    );

    if (!supported) {
        button.textContent = "Notifications unsupported";
        button.disabled = true;
        return;
    }

    if (permission === "denied") {
        button.textContent = "Notifications blocked in browser";
        return;
    }

    button.textContent = enabled
        ? "Disable notifications"
        : "Enable notifications";
}

/* Read previously handled reminder IDs */
function getHandledTaskyReminders() {
    try {
        const saved = localStorage.getItem(
            TASKY_NOTIFIED_REMINDERS_KEY
        );

        const parsed = JSON.parse(saved || "[]");

        return new Set(
            Array.isArray(parsed) ? parsed : []
        );
    } catch (error) {
        console.error(
            "Could not read reminder history:",
            error
        );

        return new Set();
    }
}

/* Save handled reminder IDs */
function saveHandledTaskyReminders(handled) {
    try {
        localStorage.setItem(
            TASKY_NOTIFIED_REMINDERS_KEY,
            JSON.stringify([...handled])
        );
    } catch (error) {
        console.error(
            "Could not save reminder history:",
            error
        );
    }
}

/* Enable or disable Tasky's notifications */
async function toggleTaskyNotifications() {
    if (!("Notification" in window)) {
        showToast(
            "This browser does not support notifications."
        );
        updateTaskyNotificationButton();
        return;
    }

    /* Turn off Tasky's notifications */
    if (areTaskyNotificationsEnabled()) {
        setTaskyNotificationsEnabled(false);

        showToast("Tasky notifications disabled.");
        return;
    }

    /* Browser permission has already been granted */
    if (Notification.permission === "granted") {
        setTaskyNotificationsEnabled(true);

        showToast("Tasky notifications enabled!");
        checkTaskyReminders();
        return;
    }

    /* Permission was previously denied */
    if (Notification.permission === "denied") {
        showToast(
            "Allow notifications in your browser or site settings."
        );

        updateTaskyNotificationButton();
        return;
    }

    /* Request permission from the user's button click */
    try {
        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {
            setTaskyNotificationsEnabled(true);

            showToast("Tasky notifications enabled!");
            checkTaskyReminders();
        } else {
            setTaskyNotificationsEnabled(false);

            showToast(
                "Notifications were not enabled. Check browser permissions."
            );
        }
    } catch (error) {
        console.error(
            "Notification permission error:",
            error
        );

        showToast(
            "Could not enable notifications."
        );

        updateTaskyNotificationButton();
    }
}

/* Display a reminder */

/* Display a reminder using the best supported method. */
function sendTaskyReminder(task) {
    const message = task.text
        ? `You have an outstanding task: ${task.text}`
        : "You have an outstanding task in Tasky.";

    const title = "Tasky Reminder";

    const options = {
        body: message,
        tag: `tasky-${task.id}`
    };

    const permitted =
        areTaskyNotificationsEnabled() &&
        "Notification" in window &&
        Notification.permission === "granted";

    if (permitted && "serviceWorker" in navigator) {
        navigator.serviceWorker.ready
            .then(registration => {
                if (
                    typeof registration.showNotification !==
                    "function"
                ) {
                    throw new Error(
                        "Service worker notifications are unsupported."
                    );
                }

                return registration.showNotification(
                    title,
                    options
                );
            })
            .catch(error => {
                console.error(
                    "Service worker notification failed:",
                    error
                );

                // Fall back to the browser notification API.
                try {
                    new Notification(title, options);
                } catch (fallbackError) {
                    console.error(
                        "Browser notification fallback failed:",
                        fallbackError
                    );

                    if (typeof showToast === "function") {
                        showToast(message);
                    }
                }
            });

        return true;
    }

    if (permitted) {
        try {
            new Notification(title, options);
            return true;
        } catch (error) {
            console.error(
                "Could not display notification:",
                error
            );
        }
    }

    if (typeof showToast === "function") {
        showToast(message);
    }

    return false;
}


/* Check for due task reminders */
function checkTaskyReminders() {
    if (!areTaskyNotificationsEnabled()) return;

    if (
        typeof tasks === "undefined" ||
        !Array.isArray(tasks)
    ) {
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

        const reminderTime =
            new Date(task.reminderAt).getTime();

        if (!Number.isFinite(reminderTime)) return;

        const reminderKey =
            `${task.id}:${task.reminderAt}`;

        if (handled.has(reminderKey)) return;

        const twelveHours = 12 * 60 * 60 * 1000;

        if (
            reminderTime <= now &&
            now - reminderTime <= twelveHours
        ) {
            sendTaskyReminder(task);

            handled.add(reminderKey);
            historyChanged = true;
        } else if (reminderTime < now - twelveHours) {
            /* Ignore very old reminders */
            handled.add(reminderKey);
            historyChanged = true;
        }
    });

    if (historyChanged) {
        saveHandledTaskyReminders(handled);
    }
}

/* Start the reminder engine */
function initializeReminderEngine() {
    if (taskyReminderInterval !== null) {
        clearInterval(taskyReminderInterval);
    }

    const enableButton = document.getElementById(
        "enableTaskyNotifications"
    );

    if (enableButton) {
        enableButton.onclick = toggleTaskyNotifications;
    }

    updateTaskyNotificationButton();
    checkTaskyReminders();

    taskyReminderInterval = setInterval(
        checkTaskyReminders,
        15000
    );
}

/* Recheck when Tasky becomes visible */
document.addEventListener(
    "visibilitychange",
    () => {
        if (!document.hidden) {
            updateTaskyNotificationButton();
            checkTaskyReminders();
        }
    }
);

/* Recheck when the window regains focus */
window.addEventListener("focus", () => {
    updateTaskyNotificationButton();
    checkTaskyReminders();
});
           
