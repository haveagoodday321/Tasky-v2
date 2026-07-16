/* ======================================
   TASKY V2
   app.js
   Main Application Controller
====================================== */

// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

    initializeApp();

});

// -------------------------------
// Initialize App
// -------------------------------

function initializeApp() {

    showTodayDate();

    setupNavigation();

    setupThemeButton();

    loadDashboard();

    console.log("✅ Tasky v2 Loaded");

}

// -------------------------------
// Dashboard
// -------------------------------

function loadDashboard() {

    if (typeof renderTasks === "function") {
        renderTasks();
    }

    if (typeof buildCalendar === "function") {
        buildCalendar();
    }

    if (typeof updateAnalytics === "function") {
        updateAnalytics();
    }

}

// -------------------------------
// Today's Date
// -------------------------------

function showTodayDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    const dateElement =
        document.getElementById("todayDate");

    if (dateElement) {

        dateElement.textContent =
            today.toLocaleDateString(
                "en-US",
                options
            );

    }

}

// -------------------------------
// Bottom Navigation
// -------------------------------

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".navBtn");

    const pages =
        document.querySelectorAll(".page");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            // Remove active button
            buttons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            // Hide pages
            pages.forEach(page =>
                page.classList.remove("active")
            );

            // Show selected page
            const page =
                document.getElementById(
                    button.dataset.page
                );

            if (page) {

                page.classList.add("active");

            }

        });

    });

}

// -------------------------------
// Theme
// -------------------------------

function setupThemeButton() {

    const themeButton =
        document.getElementById("themeBtn");

    if (!themeButton) return;

    // Load saved theme
    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "light") {

        document.body.classList.add("light");

        themeButton.textContent = "☀️";

    }

    themeButton.addEventListener("click", () => {

        document.body.classList.toggle("light");

        if (
            document.body.classList.contains("light")
        ) {

            localStorage.setItem(
                "theme",
                "light"
            );

            themeButton.textContent = "☀️";

        } else {

            localStorage.setItem(
                "theme",
                "dark"
            );

            themeButton.textContent = "🌙";

        }

    });

}

// -------------------------------
// Notifications
// -------------------------------

function showToast(message) {

    let toast =
        document.getElementById("toast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "toast";

        toast.style.position = "fixed";
        toast.style.bottom = "90px";
        toast.style.left = "50%";
        toast.style.transform =
            "translateX(-50%)";

        toast.style.background =
            "#22C55E";

        toast.style.color =
            "white";

        toast.style.padding =
            "12px 20px";

        toast.style.borderRadius =
            "12px";

        toast.style.zIndex =
            "9999";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 2500);

}

// -------------------------------
// Refresh Everything
// -------------------------------

function refreshApp() {

    if (typeof renderTasks === "function") {

        renderTasks();

    }

    if (typeof updateAnalytics === "function") {

        updateAnalytics();

    }

    if (typeof buildCalendar === "function") {

        buildCalendar();

    }

}

// -------------------------------
// Utility
// -------------------------------

function $(id) {

    return document.getElementById(id);

                                 }
