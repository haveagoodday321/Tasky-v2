// ========================================
// TASKY V2 — DATA EXPORT
// ========================================

function exportTaskyData() {

    // ----------------------------------------
    // Collect Tasky data
    // ----------------------------------------

    const backup = {
        app: "Tasky",
        version: "2.0.0",
        exportedAt: new Date().toISOString(),

        tasks: load("tasks", []),

        theme:
            localStorage.getItem("taskyTheme") || "dark"
    };


    // ----------------------------------------
    // Convert data to JSON
    // ----------------------------------------

    const json =
        JSON.stringify(
            backup,
            null,
            2
        );


    // ----------------------------------------
    // Create downloadable file
    // ----------------------------------------

    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `tasky-backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    // ----------------------------------------
    // Clean up
    // ----------------------------------------

    URL.revokeObjectURL(url);


    // ----------------------------------------
    // Notify user
    // ----------------------------------------

    if (
        typeof showToast === "function"
    ) {
        showToast(
            "📤 Tasky backup exported!"
        );
    }

}
