// ========================================
// TASKY V2 — SETTINGS
// ========================================


function resetApp() {

    const answer =
        confirm(
            "⚠️ Reset all Tasky data?\n\n" +
            "This will permanently delete your tasks and settings."
        );

    if (!answer) {
        return;
    }


    localStorage.clear();


    if (
        typeof showToast === "function"
    ) {
        showToast(
            "🗑️ Tasky has been reset."
        );
    }


    setTimeout(() => {
        location.reload();
    }, 500);

}


// ========================================
// SETTINGS BUTTONS
// ========================================

function setupSettings() {

    const exportButton =
        document.getElementById(
            "exportBtn"
        );

    const resetButton =
        document.getElementById(
            "resetAppBtn"
        );


    // ----------------------------------------
    // Export
    // ----------------------------------------

    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportTaskyData
        );

    }


    // ----------------------------------------
    // Reset
    // ----------------------------------------

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetApp
        );

    }

}


// ========================================
// INITIALIZE SETTINGS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    setupSettings
);
