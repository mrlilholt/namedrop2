export function initializeSettingsModal() {
    const settingsModal = document.createElement("div");
    settingsModal.id = "settings-modal";
    settingsModal.style.position = "fixed";
    settingsModal.style.top = "50%";
    settingsModal.style.left = "50%";
    settingsModal.style.transform = "translate(-50%, -50%)";
    settingsModal.style.width = "400px";
    settingsModal.style.padding = "20px";
    settingsModal.style.backgroundColor = "#fff";
    settingsModal.style.borderRadius = "10px";
    settingsModal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
    settingsModal.style.zIndex = "1000";

    // Content
    settingsModal.innerHTML = `
        <div id="settings-modal-header" class="modal-header">
            <img src="assets/settingsTitle.png" alt="Settings" class="modal-title-image">
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <label for="nickname-input">Update Nickname:</label>
            <input type="text" id="nickname-input" placeholder="Enter new nickname" style="
                width: 100%;
                padding: 10px;
                margin-top: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
            " />
            <button id="save-nickname" style="
                margin-top: 10px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Save</button>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <label for="notifications-toggle">Enable Notifications:</label>
            <input type="checkbox" id="notifications-toggle" />
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <label for="hints-toggle">Enable Hints:</label>
            <input type="checkbox" id="hints-toggle" />
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <label for="challenge-mode-rules">Challenge Mode Rules:</label>
            <textarea id="challenge-mode-rules" placeholder="Define your challenge rules here..." style="
                width: 100%;
                padding: 10px;
                margin-top: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
            "></textarea>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <label for="streak-saver-toggle">Enable Streak Saver:</label>
            <input type="checkbox" id="streak-saver-toggle" />
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <button id="view-session-analytics" style="
                display: inline-block;
                padding: 10px 20px;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">View Session Analytics</button>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <button id="reset-score" style="
                display: inline-block;
                padding: 10px 20px;
                background-color: #ff0000;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Reset Score</button>
        </div>
        <button id="close-settings" style="
            display: block;
            margin: 10px auto;
            padding: 10px 20px;
            background-color: #ccc;
            color: black;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;

    // Append to body
    document.body.appendChild(settingsModal);

    // Close modal logic
    document.getElementById("close-settings").addEventListener("click", () => {
        document.body.removeChild(settingsModal);
    });

    // Add functionality for saving nickname
    document.getElementById("save-nickname").addEventListener("click", () => {
        const nicknameInput = document.getElementById("nickname-input").value.trim();
        if (nicknameInput) {
            localStorage.setItem("nickname", nicknameInput);
            alert(`Nickname updated to: ${nicknameInput}`);
        } else {
            alert("Please enter a valid nickname.");
        }
    });

    // Add functionality for notifications toggle
    document.getElementById("notifications-toggle").addEventListener("change", (event) => {
        const isEnabled = event.target.checked;
        localStorage.setItem("notifications", isEnabled);
        alert(`Notifications are now ${isEnabled ? "enabled" : "disabled"}`);
    });

    // Add functionality for hints toggle
    document.getElementById("hints-toggle").addEventListener("change", (event) => {
        const isEnabled = event.target.checked;
        localStorage.setItem("hints", isEnabled);
        alert(`Hints are now ${isEnabled ? "enabled" : "disabled"}`);
    });

    // Add functionality for challenge mode rules
    document.getElementById("challenge-mode-rules").addEventListener("blur", (event) => {
        const rules = event.target.value.trim();
        localStorage.setItem("challengeRules", rules);
        alert("Challenge rules saved!");
    });

    // Add functionality for streak saver toggle
    document.getElementById("streak-saver-toggle").addEventListener("change", (event) => {
        const isEnabled = event.target.checked;
        localStorage.setItem("streakSaver", isEnabled);
        alert(`Streak Saver is now ${isEnabled ? "enabled" : "disabled"}`);
    });

    // Add functionality for session analytics button
    document.getElementById("view-session-analytics").addEventListener("click", () => {
        alert("Session Analytics feature is under construction!");
    });

    // Add functionality for resetting score
    document.getElementById("reset-score").addEventListener("click", () => {
        alert("Score has been reset!");
        // Future: Add logic to reset score
    });
}
