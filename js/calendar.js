/* ======================================
   TASKY V2
   calendar.js
   Full Calendar System
====================================== */


/* ======================================
   CALENDAR STATE
====================================== */

let calendarDate = new Date();

let selectedCalendarDate = null;


/* ======================================
   BUILD CALENDAR
====================================== */

function buildCalendar() {

    const calendar =
        document.getElementById(
            "calendar"
        );

    const monthTitle =
        document.getElementById(
            "calendarMonth"
        );


    if (!calendar || !monthTitle) {
        return;
    }


    calendar.innerHTML = "";


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    /* ==================================
       MONTH TITLE
    ================================== */

    monthTitle.textContent =
        calendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    /* ==================================
       FIRST DAY OF MONTH
    ================================== */

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    /*
       JavaScript:
       Sunday = 0
       Monday = 1

       We want Monday = 0
    */

    let startingDay =
        firstDay.getDay();

    startingDay =
        startingDay === 0
            ? 6
            : startingDay - 1;


    /* ==================================
       DAYS IN MONTH
    ================================== */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* ==================================
       PREVIOUS MONTH EMPTY DAYS
    ================================== */

    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        const emptyDay =
            document.createElement(
                "div"
            );

        emptyDay.className =
            "calendar-empty";

        calendar.appendChild(
            emptyDay
        );

    }


    /* ==================================
       CREATE DAYS
    ================================== */

    for (
        let dayNumber = 1;
        dayNumber <= daysInMonth;
        dayNumber++
    ) {

        const day =
            document.createElement(
                "button"
            );


        day.type = "button";

        day.className =
            "day";


        /* ==================================
           DATE OBJECT
        ================================== */

        const date =
            new Date(
                year,
                month,
                dayNumber
            );


        const dateString =
            formatCalendarDate(
                date
            );


        day.dataset.date =
            dateString;


        /* ==================================
           DAY NUMBER
        ================================== */

        const number =
            document.createElement(
                "span"
            );

        number.className =
            "day-number";

        number.textContent =
            dayNumber;


        day.appendChild(
            number
        );


        /* ==================================
           TODAY
        ================================== */

        const today =
            new Date();


        if (
            date.getFullYear() ===
                today.getFullYear() &&

            date.getMonth() ===
                today.getMonth() &&

            date.getDate() ===
                today.getDate()
        ) {

            day.classList.add(
                "today"
            );

        }


        /* ==================================
           SELECTED DATE
        ================================== */

        if (!selectedCalendarDate) {
    const today = new Date();

    if (
        year === today.getFullYear() &&
        month === today.getMonth()
    ) {
        selectedCalendarDate =
            formatCalendarDate(today);
    }
        }

      if (selectedCalendarDate) {
    showSelectedDateTasks(selectedCalendarDate);
      }


        /* ==================================
           TASK INDICATOR
        ================================== */

        const dayTasks =
            getTasksForCalendarDate(
                dateString
            );


        if (dayTasks.length > 0) {

            day.classList.add(
                "has-tasks"
            );


            const indicator =
                document.createElement(
                    "span"
                );

            indicator.className =
                "task-dot";

            indicator.textContent =
                "•";


            day.appendChild(
                indicator
            );


            /* Number of tasks */

            if (dayTasks.length > 1) {

                const count =
                    document.createElement(
                        "span"
                    );

                count.className =
                    "task-count";

                count.textContent =
                    dayTasks.length;

                day.appendChild(
                    count
                );

            }

        }


        /* ==================================
           CLICK DATE
        ================================== */

        day.addEventListener(
            "click",
            function () {

                selectedCalendarDate =
                    this.dataset.date;

                buildCalendar();

                showSelectedDateTasks(
                    selectedCalendarDate
                );

            }
        );


        calendar.appendChild(
            day
        );

    }


    /* ==================================
       IF NO DATE SELECTED
    ================================== */

    if (
        !selectedCalendarDate
    ) {

        const today =
            new Date();


        /*
           Only select today if
           we're viewing the current month.
        */

        if (
            year ===
                today.getFullYear() &&

            month ===
                today.getMonth()
        ) {

            selectedCalendarDate =
                formatCalendarDate(
                    today
                );

            showSelectedDateTasks(
                selectedCalendarDate
            );

            buildCalendar();

        }

    }

}


/* ======================================
   GET TASKS FOR DATE
====================================== */

function getTasksForCalendarDate(
    dateString
) {

    if (
        typeof tasks ===
        "undefined"
    ) {

        return [];

    }


    return tasks.filter(
        task =>
            task.deadline ===
            dateString
    );

}


/* ======================================
   SHOW SELECTED DATE TASKS
====================================== */

function showSelectedDateTasks(
    dateString
) {

    const container =
        document.getElementById(
            "selectedDateTasks"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    const title =
        document.querySelector(
            "#selectedDateTasks"
        );


    const dayTasks =
        getTasksForCalendarDate(
            dateString
        );


    /* ==================================
       DATE HEADING
    ================================== */

    const heading =
        document.createElement(
            "li"
        );

    heading.className =
        "selected-date-heading";

    heading.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    container.appendChild(
        heading
    );


    /* ==================================
       NO TASKS
    ================================== */

    if (
        dayTasks.length === 0
    ) {

        const empty =
            document.createElement(
                "li"
            );

        empty.className =
            "calendar-no-tasks";

        empty.textContent =
            "No tasks scheduled for this day. 🎉";


        container.appendChild(
            empty
        );

        return;

    }


    /* ==================================
       TASKS
    ================================== */

    dayTasks.forEach(
        task => {

            const li =
                document.createElement(
                    "li"
                );


            li.className =
                "calendar-task";


            if (task.completed) {

                li.classList.add(
                    "completed"
                );

            }


            const title =
                document.createElement(
                    "strong"
                );

            title.textContent =
                task.text;


            const meta =
                document.createElement(
                    "span"
                );

            meta.textContent =
                task.completed
                    ? "✓ Completed"
                    : `${task.priority} priority`;


            li.appendChild(
                title
            );

            li.appendChild(
                meta
            );


            container.appendChild(
                li
            );

        }
    );

}


/* ======================================
   FORMAT DATE
====================================== */

function formatCalendarDate(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


/* ======================================
   PREVIOUS MONTH
====================================== */

function previousMonth() {

    calendarDate.setMonth(
        calendarDate.getMonth() - 1
    );


    selectedCalendarDate =
        null;


    buildCalendar();


}


/* ======================================
   NEXT MONTH
====================================== */

function nextMonth() {

    calendarDate.setMonth(
        calendarDate.getMonth() + 1
    );


    selectedCalendarDate =
        null;


    buildCalendar();

}


/* ======================================
   SETUP CALENDAR BUTTONS
====================================== */

function setupCalendar() {

    const previousButton =
        document.getElementById(
            "prevMonthBtn"
        );


    const nextButton =
        document.getElementById(
            "nextMonthBtn"
        );


    if (previousButton) {

        previousButton.onclick =
            previousMonth;

    }


    if (nextButton) {

        nextButton.onclick =
            nextMonth;

    }


    buildCalendar();

}


/* ======================================
   START
====================================== */

document.addEventListener(
    "DOMContentLoaded",
    setupCalendar
);
