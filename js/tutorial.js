export function initializeTutorialModal() {
    const tutorialModal = document.createElement("div");
    tutorialModal.id = "tutorial-modal";
    tutorialModal.style.position = "fixed";
    tutorialModal.style.top = "50%";
    tutorialModal.style.left = "50%";
    tutorialModal.style.transform = "translate(-50%, -50%)";
    tutorialModal.style.width = "500px";
    tutorialModal.style.padding = "20px";
    tutorialModal.style.backgroundColor = "#fff";
    tutorialModal.style.borderRadius = "10px";
    tutorialModal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
    tutorialModal.style.zIndex = "1000";
    tutorialModal.style.display = "none"; // Initially hidden

    let currentStep = 0;

    // Tutorial steps
    const steps = [
        {
            title: "Welcome to the App!",
            content: "This app is all about matching names to faces. Let’s walk through the basics!"
        },
        {
            title: "Game Basics",
            content: "Guess the name of the person in the picture. If you're correct, you'll earn points!"
        },
        {
            title: "Skipping",
            content: "If you’re unsure, click the 'Skip' button to move to the next image."
        },
        {
            title: "Leaderboard",
            content: "Compete with others and track your progress on the leaderboard!"
        },
        {
            title: "Settings",
            content: "Customize your experience with notifications, hints, streak savers, and more!"
        },
        {
            title: "Have Fun!",
            content: "Enjoy the game, sharpen your skills, and aim for the top of the leaderboard!"
        }
    ];

    // Modal content
    tutorialModal.innerHTML = `
        <div id="tutorial-header" style="text-align: center; margin-bottom: 20px;">
            <h2 id="tutorial-title">${steps[currentStep].title}</h2>
        </div>
        <div id="tutorial-content" style="text-align: center; margin-bottom: 20px;">
            <p>${steps[currentStep].content}</p>
        </div>
        <div id="tutorial-navigation" style="display: flex; justify-content: space-between; align-items: center;">
            <button id="prev-tutorial" style="
                padding: 10px 20px;
                background-color: #ccc;
                color: black;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                visibility: hidden; /* Hidden on the first step */
            ">Previous</button>
            <button id="next-tutorial" style="
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Next</button>
        </div>
        <button id="close-tutorial" style="
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #ccc;
            color: black;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;

    // Append to body
    document.body.appendChild(tutorialModal);

    // Event listeners for navigation
    document.getElementById("prev-tutorial").addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            updateTutorialContent();
        }
    });

    document.getElementById("next-tutorial").addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateTutorialContent();
        } else {
            closeTutorial();
        }
    });

    document.getElementById("close-tutorial").addEventListener("click", closeTutorial);

    function updateTutorialContent() {
        document.getElementById("tutorial-title").textContent = steps[currentStep].title;
        document.getElementById("tutorial-content").querySelector("p").textContent = steps[currentStep].content;

        // Update button visibility
        document.getElementById("prev-tutorial").style.visibility = currentStep === 0 ? "hidden" : "visible";
        document.getElementById("next-tutorial").textContent = currentStep === steps.length - 1 ? "Finish" : "Next";
    }

    function closeTutorial() {
        tutorialModal.style.display = "none";
    }

    // Function to open the tutorial
    window.openTutorial = function () {
        currentStep = 0; // Reset to the first step
        updateTutorialContent();
        tutorialModal.style.display = "block";
    };
}
