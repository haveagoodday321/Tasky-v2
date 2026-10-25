/* ===============================
   utils.js
=============================== */

function $(id) {
    return document.getElementById(id);
}

function create(tag) {
    return document.createElement(tag);
}

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}

function randomItem(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


/**
 * Returns a local calendar date as YYYY-MM-DD.
 * Returns an empty string for an invalid date.
 */
function getLocalDateKey(date = new Date()) {
    const parsed = date instanceof Date
        ? date
        : new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    const year = parsed.getFullYear();
    const month = String(
        parsed.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        parsed.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
