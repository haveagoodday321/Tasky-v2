/* ============================
   calendar.js
============================ */

function buildCalendar() {

    const calendar =
        document.getElementById("calendar");

    if (!calendar) return;

    calendar.innerHTML = "";

    const today = new Date();

    const days =
        new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        ).getDate();

    document.getElementById(
        "calendarMonth"
    ).textContent =
        today.toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

    for (let i = 1; i <= days; i++) {

        const day =
            document.createElement("div");

        day.className = "day";

        if (i === today.getDate()) {

            day.classList.add("today");

        }

        day.textContent = i;

        calendar.appendChild(day);

    }

}
