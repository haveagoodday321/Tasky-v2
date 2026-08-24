/* ======================================
   TASKY V2
   theme.js
   Theme Management System
====================================== */


/* ======================================
   LOAD SAVED THEME
====================================== */

function loadTheme() {

    const savedTheme =
        localStorage.getItem("taskyTheme");


    if (savedTheme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );

    }


    updateThemeButtons();

}


/* ======================================
   TOGGLE THEME
====================================== */

function toggleTheme() {

    document.body.classList.toggle(
        "light-theme"
    );


    const currentTheme =
        document.body.classList.contains(
            "light-theme"
        )
            ? "light"
            : "dark";


    localStorage.setItem(
        "taskyTheme",
        currentTheme
    );


    updateThemeButtons();

}


/* ======================================
   UPDATE BUTTONS
====================================== */

function updateThemeButtons() {

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );


    const headerThemeButton =
        document.getElementById("themeBtn");

    const settingsThemeButton =
        document.getElementById(
            "settingsThemeBtn"
        );


    if (headerThemeButton) {

        headerThemeButton.textContent =
            isLight
                ? "🌙"
                : "☀️";

    }


    if (settingsThemeButton) {

        settingsThemeButton.textContent =
            isLight
                ? "🌙 Switch to Dark Mode"
                : "☀️ Switch to Light Mode";

    }

}


/* ======================================
   SETUP THEME BUTTONS
====================================== */

function setupTheme() {

    const headerThemeButton =
        document.getElementById("themeBtn");


    const settingsThemeButton =
        document.getElementById(
            "settingsThemeBtn"
        );


    if (headerThemeButton) {

        headerThemeButton.addEventListener(
            "click",
            toggleTheme
        );

    }


    if (settingsThemeButton) {

        settingsThemeButton.addEventListener(
            "click",
            toggleTheme
        );

    }

}


/* ======================================
   INITIALIZE THEME
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

        setupTheme();

    }
);
