/* ======================================
   TASKY V2
   app.js
   Main Application Controller
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


/* ======================================
   APP INITIALIZATION
====================================== */

function initializeApp() {

    console.log("🚀 Starting Tasky...");

    showTodayDate();

    setupNavigation();

    refreshApp();

    console.log(
        "✅ Tasky v2 Loaded Successfully"
    );

}


/* ======================================
   NAVIGATION
====================================== */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".navBtn");

    const pages =
        document.querySelectorAll(".page");

    if (!buttons.length || !pages.length) {

        console.warn(
            "Navigation buttons or pages were not found."
        );

        return;

    }

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const pageId =
                    button.dataset.page;

                showPage(pageId);

            }
        );

    });

}


function showPage(pageId) {

    const buttons =
        document.querySelectorAll(".navBtn");

    const pages =
        document.querySelectorAll(".page");

    const targetPage =
        document.getElementById(pageId);

    if (!targetPage) {

        console.error(
            `Page "${pageId}" was not found.`
        );

        return;

    }


    /* Hide all pages */

    pages.forEach(page => {

        page.classList.remove("active");

    });


    /* Show selected page */

    targetPage.classList.add("active");


    /* Update navigation */

    buttons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );

    });


    /* Refresh the selected page */

    updateCurrentPage(pageId);

}


/* ======================================
   PAGE UPDATES
====================================== */

function updateCurrentPage(pageId) {

    if (
        pageId === "tasksPage" &&
        typeof renderTasks === "function"
    ) {

        renderTasks();

    }


    if (
        pageId === "calendarPage" &&
        typeof buildCalendar === "function"
    ) {

        buildCalendar();

    }


    if (
        pageId === "analyticsPage" &&
        typeof updateAnalytics === "function"
    ) {

        updateAnalytics();

    }

}


/* ======================================
   TODAY'S DATE
====================================== */

function showTodayDate() {

    const dateElement =
        document.getElementById("todayDate");

    if (!dateElement) return;


    const today =
        new Date();

    const options = {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"

    };


    dateElement.textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );

}


/* ======================================
   TOAST MESSAGES
====================================== */

function showToast(message) {

    let toast =
        document.getElementById("toast");


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }


    toast.textContent =
        message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* ======================================
   REFRESH APP
====================================== */

function refreshApp() {

    if (
        typeof renderTasks === "function"
    ) {

        renderTasks();

    }


    if (
        typeof buildCalendar === "function"
    ) {

        buildCalendar();

    }


    if (
        typeof updateAnalytics === "function"
    ) {

        updateAnalytics();

    }

       }
