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
