export function initializeAboutModal() {
    const aboutModal = document.createElement("div");
    aboutModal.id = "about-modal";
    aboutModal.style.position = "fixed";
    aboutModal.style.top = "50%";
    aboutModal.style.left = "50%";
    aboutModal.style.transform = "translate(-50%, -50%)";
    aboutModal.style.width = "400px";
    aboutModal.style.padding = "20px";
    aboutModal.style.backgroundColor = "#fff";
    aboutModal.style.borderRadius = "10px";
    aboutModal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
    aboutModal.style.zIndex = "1000";
    aboutModal.style.textAlign = "center";

    // Modal content
    aboutModal.innerHTML = `
        <h2>About the App</h2>
        <p>
            Welcome to the <strong>NameDrop</strong> app, a fun and interactive way to match names to faces. 
            This app challenges your memory while providing an engaging and competitive experience.
        </p>
        <h3>Features</h3>
        <ul style="text-align: left; margin: 0 auto; display: inline-block;">
            <li>🎯 Guess names and earn points</li>
            <li>🔥 Track streaks and aim for milestones</li>
            <li>🏆 Compete on the leaderboard</li>
            <li>💡 Get hints for challenging names</li>
        </ul>
        <h3>Tech Stack</h3>
        <p>
            Built using modern tools like:
            <ul style="text-align: left; margin: 0 auto; display: inline-block;">
                <li>HTML, CSS, and JavaScript</li>
                <li>Firebase for database and authentication</li>
                <li>Netlify for deployment</li>
            </ul>
        </p>
        <h3>About the Creator</h3>
        <p>
            This app was developed by someone who is not just a coding wizard but also incredibly awesome! 😉
            Fueled by passion, creativity, and a love for making fun, engaging apps, they’ve put their heart
            and soul into making NameDrop a memorable experience for you.
        </p>
        <button id="close-about-modal" style="
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;

    // Append modal to the body
    document.body.appendChild(aboutModal);

    // Close button functionality
    document.getElementById("close-about-modal").addEventListener("click", () => {
        aboutModal.style.display = "none"; // Hide the modal instead of removing it
    });
}
