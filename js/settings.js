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
    <div id="upload-modal" class="modal">

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
        </div>
    `;

    // Append to body
    document.body.appendChild(settingsModal);

    // Close modal logic
    document.getElementById("close-settings").addEventListener("click", () => {
        document.body.removeChild(settingsModal);
    });

    // Add functionality for dark mode toggle
// Add event listener to the dark mode toggle switch
// Event listener for dark mode toggle
document.getElementById("dark-mode-toggle").addEventListener("click", (event) => {
    const isDarkMode = event.target.textContent === "toggle_off"; // Check the current icon state
    event.target.textContent = isDarkMode ? "toggle_on" : "toggle_off"; // Toggle the icon
    toggleDarkMode(isDarkMode);
});

// Function to toggle dark mode
function toggleDarkMode(isDarkMode) {
    const darkModeLink = document.getElementById("dark-mode-css");

    if (isDarkMode) {
        if (!darkModeLink) {
            const link = document.createElement("link");
            link.id = "dark-mode-css";
            link.rel = "stylesheet";
            link.href = "/css/darkmode.css";
            document.head.appendChild(link);
        }
        localStorage.setItem("theme", "dark");
    } else {
        if (darkModeLink) {
            document.head.removeChild(darkModeLink);
        }
        localStorage.setItem("theme", "light");
    }
}


// Check localStorage to apply the theme on load
document.addEventListener("DOMContentLoaded", () => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
        toggleDarkMode(true);
        const darkModeToggle = document.getElementById("dark-mode-toggle");
        if (darkModeToggle) darkModeToggle.textContent = "toggle_on";
    } else {
        toggleDarkMode(false);
    }
});


    // Add functionality for saving nickname
    document.getElementById("save-nickname").addEventListener("click", () => {
        const nicknameInput = document.getElementById("nickname-input").value.trim();
        if (nicknameInput) {
            // Save nickname to localStorage
            localStorage.setItem("nickname", nicknameInput);
    
            // Provide user feedback
            alert(`Nickname updated to: ${nicknameInput}`);
    
            // Optionally update the profile modal immediately if it's open
            const profileNickname = document.getElementById("profile-nickname");
            if (profileNickname) {
                profileNickname.innerHTML = `<strong>Nickname:</strong> ${nicknameInput}`;
            }
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
