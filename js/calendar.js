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

const scheduledBlocks =
    getScheduleBlocksForCalendarDate(
        dateString
    );

const scheduledTaskIds =
    scheduledBlocks
        .filter(
            block => block.type === "task"
        )
        .map(
            block => String(block.taskId)
        );

const uniqueTaskIds =
    new Set([
        ...dayTasks.map(
            task => String(task.id)
        ),
        ...scheduledTaskIds
    ]);

const dayItemCount =
    uniqueTaskIds.size;


if (dayItemCount > 0) {

    day.classList.add("has-tasks");

    const indicator =
        document.createElement("span");

    indicator.className = "task-dot";
    indicator.textContent = "•";

    day.appendChild(indicator);


    if (dayItemCount > 1) {

        const count =
            document.createElement("span");

        count.className = "task-count";
        count.textContent = dayItemCount;

        day.appendChild(count);

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


function getTasksForCalendarDate(dateString) {

    if (typeof tasks === "undefined") {
        return [];
    }

    return tasks.filter(
        task => task.deadline === dateString
    );

}


/* ======================================
   GET SAVED DAILY SCHEDULE BLOCKS
====================================== */

function getScheduleBlocksForCalendarDate(dateString) {

    try {

        const saved =
            localStorage.getItem("taskyDailyPlan");

        if (!saved) {
            return [];
        }

        const plan = JSON.parse(saved);

        if (
            !plan ||
            !Array.isArray(plan.scheduleBlocks)
        ) {
            return [];
        }

        if (plan.date !== dateString) {
            return [];
        }

const liveTasks = Array.isArray(tasks)
    ? tasks
    : [];

const tasksById = new Map(
    liveTasks.map(task => [
        String(task.id),
        task
    ])
);

return plan.scheduleBlocks
    .filter(
        block =>
            block &&
            block.date === dateString
    )
    .filter(
        block =>
            block.type !== "task" ||
            tasksById.has(String(block.taskId))
    )
    .map(block => {
        if (block.type !== "task") {
            return block;
        }

        const currentTask = tasksById.get(
            String(block.taskId)
        );

        return {
            ...block,
            title: currentTask.text
        };
    })
    .sort(
        (a, b) =>
            (Number(a.order) || 0) -
            (Number(b.order) || 0)
    );

    } catch (error) {

        console.error(
            "Could not read Calendar schedule:",
            error
        );

        return [];

    }

}



/* ======================================
   SHOW SELECTED DATE TASKS
====================================== */


function showSelectedDateTasks(dateString) {

    const container =
        document.getElementById(
            "selectedDateTasks"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const date =
        new Date(`${dateString}T00:00:00`);

    const heading =
        document.createElement("li");

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

    container.appendChild(heading);


    /* ==================================
       DEADLINE TASKS
    ================================== */

    const dayTasks =
        getTasksForCalendarDate(dateString);

    const deadlineHeading =
        document.createElement("li");

    deadlineHeading.className =
        "selected-date-heading";

    deadlineHeading.textContent =
        "📝 Deadline Tasks";

    container.appendChild(deadlineHeading);


    if (dayTasks.length === 0) {

        const empty =
            document.createElement("li");

        empty.className =
            "calendar-no-tasks";

        empty.textContent =
            "No deadline tasks for this day.";

        container.appendChild(empty);

    } else {

        dayTasks.forEach(task => {

            const li =
                document.createElement("li");

            li.className = "calendar-task";

            if (task.completed) {
                li.classList.add("completed");
            }

            const title =
                document.createElement("strong");

            title.textContent = task.text;

            const meta =
                document.createElement("span");

            meta.textContent =
                task.completed
                    ? "✓ Completed"
                    : `${task.priority} priority`;

            li.appendChild(title);
            li.appendChild(meta);

            container.appendChild(li);

        });

    }


    /* ==================================
       BUILD MY DAY SCHEDULE
    ================================== */

    const scheduledBlocks =
        getScheduleBlocksForCalendarDate(
            dateString
        );

    const scheduleHeading =
        document.createElement("li");

    scheduleHeading.className =
        "selected-date-heading";

    scheduleHeading.textContent =
        "📅 Build My Day";

    container.appendChild(scheduleHeading);


    const taskBlocks =
        scheduledBlocks.filter(
            block => block.type === "task"
        );

    if (taskBlocks.length === 0) {

        const empty =
            document.createElement("li");

        empty.className =
            "calendar-no-tasks";

        empty.textContent =
            "No saved daily schedule for this day.";

        container.appendChild(empty);

    } else {

        scheduledBlocks.forEach(block => {

            const li =
                document.createElement("li");

            if (block.type === "break") {

                li.className =
                    "calendar-schedule-break";

                li.textContent =
                    `☕ ${block.startTime} · ${block.duration} min break`;

            } else {

                li.className =
                    "calendar-task calendar-scheduled-task";

                const title =
                    document.createElement("strong");

                title.textContent =
                    block.title || "Scheduled task";

                const meta =
                    document.createElement("span");

                meta.textContent =
                    `${block.startTime} – ${block.endTime || ""} · ${block.duration} min`;

                li.appendChild(title);
                li.appendChild(meta);

            }

            container.appendChild(li);

        });

    }

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
