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
    
// ========================================
// TASKY V2 — DATA IMPORT
// ========================================

function importTaskyData(file) {

    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function(event) {

        try {

            const backup =
                JSON.parse(
                    event.target.result
                );

            // ----------------------------------------
            // Validate backup
            // ----------------------------------------

            if (
                !backup ||
                backup.app !== "Tasky" ||
                !Array.isArray(backup.tasks)
            ) {

                throw new Error(
                    "Invalid Tasky backup."
                );

            }

            // ----------------------------------------
            // Confirm replacement
            // ----------------------------------------

            const answer =
                confirm(
                    "⚠️ Import this backup?\n\n" +
                    "Your current tasks will be replaced " +
                    "by the tasks in this backup."
                );

            if (!answer) {
                return;
            }

            // ----------------------------------------
            // Save imported tasks
            // ----------------------------------------

            localStorage.setItem(
                "tasks",
                JSON.stringify(
                    backup.tasks
                )
            );

            // ----------------------------------------
            // Restore theme
            // ----------------------------------------

            if (
                backup.theme === "light" ||
                backup.theme === "dark"
            ) {

                localStorage.setItem(
                    "taskyTheme",
                    backup.theme
                );

            }

            // ----------------------------------------
            // Success
            // ----------------------------------------

            if (
                typeof showToast === "function"
            ) {

                showToast(
                    "📥 Backup imported successfully!"
                );

            }

            setTimeout(() => {
                location.reload();
            }, 700);

        }

        catch (error) {

            console.error(
                "Tasky import error:",
                error
            );

            if (
                typeof showToast === "function"
            ) {

                showToast(
                    "❌ Invalid Tasky backup file."
                );

            }

        }

    };

    reader.readAsText(file);
}
    
}
