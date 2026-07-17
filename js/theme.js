/* ============================
   theme.js
============================ */

function toggleTheme() {

    document.body.classList.toggle("light");

    const mode =
        document.body.classList.contains("light")
        ? "light"
        : "dark";

    save("theme", mode);

}

function loadTheme() {

    const theme =
        load("theme", "dark");

    if (theme === "light") {

        document.body.classList.add("light");

    }

}

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    const btn =
        document.getElementById("themeBtn");

    if (btn) {

        btn.addEventListener("click", toggleTheme);

    }

});
