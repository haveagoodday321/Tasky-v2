
/* ======================================
   TASKY FOCUS SESSIONS
====================================== */

const FOCUS_STATE_KEY = "tasky_focus_state_v1";
const FOCUS_HISTORY_KEY = "tasky_focus_history_v1";

let focusInterval = null;
let focusRemaining = 25 * 60;
let focusRunning = false;
let focusPaused = false;
let focusEndTime = null;
let focusSelectedTaskId = "";
let focusSessionStartedAt = null;

function readFocusHistory() {
    try {
        const data = JSON.parse(
            localStorage.getItem(FOCUS_HISTORY_KEY) || "[]"
        );
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveFocusState() {
    const state = {
        remaining: focusRemaining,
        running: focusRunning,
        paused: focusPaused,
        endTime: focusEndTime,
        taskId: focusSelectedTaskId,
        startedAt: focusSessionStartedAt
    };

    localStorage.setItem(FOCUS_STATE_KEY, JSON.stringify(state));
}

function restoreFocusState() {
    try {
        const state = JSON.parse(
            localStorage.getItem(FOCUS_STATE_KEY) || "null"
        );

        if (!state) return;

        focusRemaining = Math.max(0, Number(state.remaining) || 0);
        focusSelectedTaskId = state.taskId || "";
        focusSessionStartedAt = state.startedAt || null;
        focusPaused = Boolean(state.paused);
        focusRunning = Boolean(state.running);
        focusEndTime = state.endTime || null;

        if (focusRunning && focusEndTime) {
            focusRemaining = Math.max(
                0,
                Math.ceil((focusEndTime - Date.now()) / 1000)
            );
        }
    } catch (error) {
        console.error("Could not restore focus session:", error);
    }
}

function populateFocusTasks() {
    const select = document.getElementById("focusTaskSelect");
    if (!select) return;

    const previous = focusSelectedTaskId;
    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a task";
    select.appendChild(placeholder);

    if (Array.isArray(tasks)) {
        tasks.filter(task => task && !task.completed)
            .forEach(task => {
                const option = document.createElement("option");
                option.value = String(task.id);
                option.textContent = task.text;
                select.appendChild(option);
            });
    }

    if ([...select.options].some(option => option.value === String(previous))) {
        select.value = String(previous);
    } else {
        focusSelectedTaskId = "";
        select.value = "";
    }
}

function renderFocusTimer() {
    const timer = document.getElementById("focusTimer");
    const status = document.getElementById("focusStatus");
    const start = document.getElementById("focusStartBtn");
    const pause = document.getElementById("focusPauseBtn");
    const finish = document.getElementById("focusFinishBtn");
    const duration = document.getElementById("focusDuration");
    const taskSelect = document.getElementById("focusTaskSelect");

    const minutes = Math.floor(focusRemaining / 60);
    const seconds = focusRemaining % 60;

    if (timer) {
        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    if (start) start.disabled = focusRunning || focusPaused;
    if (pause) {
        pause.disabled = !focusRunning && !focusPaused;
        pause.textContent = focusPaused ? "Resume" : "Pause";
    }
    if (finish) finish.disabled = !focusRunning && !focusPaused;
    if (duration) duration.disabled = focusRunning || focusPaused;
    if (taskSelect) taskSelect.disabled = focusRunning || focusPaused;

    if (status) {
        status.textContent = focusRunning
            ? "You're in a focus session. Keep going!"
            : focusPaused
                ? "Session paused."
                : "Ready when you are.";
    }

    renderFocusSummary();
}

function startFocusSession() {
    if (focusRunning || focusPaused) return;

    const select = document.getElementById("focusTaskSelect");
    const duration = document.getElementById("focusDuration");

    focusSelectedTaskId = select ? select.value : "";

    if (!focusSelectedTaskId) {
        const status = document.getElementById("focusStatus");
        if (status) status.textContent = "Choose a task before starting.";
        return;
    }

    const taskExists = Array.isArray(tasks) &&
        tasks.some(task =>
            String(task.id) === String(focusSelectedTaskId) &&
            !task.completed
        );

    if (!taskExists) {
        if (typeof showToast === "function") {
            showToast("Choose an incomplete task.");
        }
        populateFocusTasks();
        return;
    }

    const minutes = Math.max(
        1,
        Number(duration ? duration.value : 25) || 25
    );

    focusRemaining = minutes * 60;
    focusSessionStartedAt = new Date().toISOString();
    focusEndTime = Date.now() + focusRemaining * 1000;
    focusRunning = true;
    focusPaused = false;

    saveFocusState();
    renderFocusTimer();

    focusInterval = setInterval(tickFocusSession, 1000);
}

function tickFocusSession() {
    if (!focusRunning || !focusEndTime) return;

    focusRemaining = Math.max(
        0,
        Math.ceil((focusEndTime - Date.now()) / 1000)
    );

    renderFocusTimer();

    if (focusRemaining <= 0) {
        finishFocusSession(true);
    } else {
        saveFocusState();
    }
}

function toggleFocusPause() {
    if (focusRunning) {
        focusRemaining = Math.max(
            0,
            Math.ceil((focusEndTime - Date.now()) / 1000)
        );

        focusRunning = false;
        focusPaused = true;
        focusEndTime = null;

        if (focusInterval !== null) {
            clearInterval(focusInterval);
            focusInterval = null;
        }
    } else if (focusPaused) {
        focusPaused = false;
        focusRunning = true;
        focusEndTime = Date.now() + focusRemaining * 1000;
        focusInterval = setInterval(tickFocusSession, 1000);
    } else {
        return;
    }

    saveFocusState();
    renderFocusTimer();
}

function finishFocusSession(completed = false) {
    if (!focusRunning && !focusPaused) return;

    if (focusInterval !== null) {
        clearInterval(focusInterval);
        focusInterval = null;
    }

    const initialDuration = Math.max(
        0,
        Math.round(
            (Date.now() - new Date(focusSessionStartedAt).getTime()) / 1000
        )
    );

    const history = readFocusHistory();

    // Only a completed timer counts as a completed session.
    if (completed && focusRemaining <= 0) {
        const task = Array.isArray(tasks)
            ? tasks.find(item =>
                String(item.id) === String(focusSelectedTaskId)
            )
            : null;

        history.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            taskId: focusSelectedTaskId,
            taskName: task ? task.text : "Task",
            startedAt: focusSessionStartedAt,
            completedAt: new Date().toISOString(),
            plannedMinutes: Math.round(initialDuration / 60)
        });

        localStorage.setItem(FOCUS_HISTORY_KEY, JSON.stringify(history));

        if (typeof showToast === "function") {
            showToast("🎯 Focus session completed!");
        }
    } else if (typeof showToast === "function") {
        showToast("Focus session ended. It wasn't counted as completed.");
    }

    focusRunning = false;
    focusPaused = false;
    focusEndTime = null;
    focusSessionStartedAt = null;
    focusSelectedTaskId = "";

    const duration = document.getElementById("focusDuration");
    focusRemaining = (Number(duration ? duration.value : 25) || 25) * 60;

    localStorage.removeItem(FOCUS_STATE_KEY);

    populateFocusTasks();
    renderFocusTimer();
    renderFocusHistory();
}

function renderFocusSummary() {
    const history = readFocusHistory();

    const totalMinutes = history.reduce(
        (sum, session) => sum + (Number(session.plannedMinutes) || 0),
        0
    );

    const timeElement = document.getElementById("totalFocusTime");
    const countElement = document.getElementById("completedFocusSessions");

    if (timeElement) {
        timeElement.textContent = `${totalMinutes} minutes`;
    }

    if (countElement) {
        countElement.textContent = history.length;
    }
}

function renderFocusHistory() {
    const list = document.getElementById("focusHistory");
    if (!list) return;

    list.replaceChildren();

    const history = readFocusHistory().slice(0, 10);

    if (!history.length) {
        const item = document.createElement("li");
        item.textContent = "No completed sessions yet.";
        list.appendChild(item);
        return;
    }

    history.forEach(session => {
        const item = document.createElement("li");
        const date = new Date(session.completedAt);
        item.textContent =
            `${session.taskName} — ${session.plannedMinutes} minutes — ${date.toLocaleString()}`;
        list.appendChild(item);
    });
}

function initializeFocusSessions() {
    const start = document.getElementById("focusStartBtn");
    const pause = document.getElementById("focusPauseBtn");
    const finish = document.getElementById("focusFinishBtn");
    const duration = document.getElementById("focusDuration");
    const taskSelect = document.getElementById("focusTaskSelect");

    if (!start || start.dataset.initialized === "true") return;

    start.dataset.initialized = "true";

    start.addEventListener("click", startFocusSession);
    pause.addEventListener("click", toggleFocusPause);
    finish.addEventListener("click", () => finishFocusSession(false));

    if (duration) {
        duration.addEventListener("change", () => {
            focusRemaining = (Number(duration.value) || 25) * 60;
            renderFocusTimer();
        });
    }

    if (taskSelect) {
        taskSelect.addEventListener("change", () => {
            focusSelectedTaskId = taskSelect.value;
        });
    }

    restoreFocusState();
    populateFocusTasks();
    renderFocusTimer();
    renderFocusHistory();

    if (focusRunning && focusRemaining > 0) {
        focusInterval = setInterval(tickFocusSession, 1000);
        tickFocusSession();
    } else if (focusRunning && focusRemaining <= 0) {
        finishFocusSession(true);
    }
}

document.addEventListener("DOMContentLoaded", initializeFocusSessions);
          
