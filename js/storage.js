/* ============================
   storage.js
============================ */

function save(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}

function load(key, defaultValue = []) {

    const data = localStorage.getItem(key);

    if (data === null) {
        return defaultValue;
    }

    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Storage Error:", e);
        return defaultValue;
    }

}

function remove(key) {

    localStorage.removeItem(key);

}

function clearStorage() {

    localStorage.clear();

}
