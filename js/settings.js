// settings.js
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
        <h2 style="text-align: center;">Settings</h2>
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
        <div style="margin: 20px 0; display: flex; align-items: center; justify-content: space-between;">
            <span class="material-icons">dark_mode</span>
            <span id="dark-mode-toggle" class="material-icons" style="cursor: pointer;">toggle_off</span>
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

    // Add functionality for dark mode toggle
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    darkModeToggle.addEventListener("click", () => {
        const isActive = darkModeToggle.textContent === "toggle_on";
        darkModeToggle.textContent = isActive ? "toggle_off" : "toggle_on";
        document.body.classList.toggle("dark-mode", !isActive);
    });

    // Add functionality for saving nickname
    document.getElementById("save-nickname").addEventListener("click", () => {
        const nicknameInput = document.getElementById("nickname-input").value.trim();
        if (nicknameInput) {
            alert(`Nickname updated to: ${nicknameInput}`);
            // Save nickname to database or update UI
        } else {
            alert("Please enter a valid nickname.");
        }
    });

    // Add functionality for resetting score
    document.getElementById("reset-score").addEventListener("click", () => {
        alert("Score has been reset!");
        // Future: Add logic to reset score
    });
}
