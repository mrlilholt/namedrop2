import { db, collection, query, orderBy, getDocs } from "./firebase.js";

export function initializeLeaderboardModal() {
    // Check if the modal exists
    let modal = document.getElementById("leaderboard-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "leaderboard-modal";
        modal.classList.add("modal"); // Modal class for styling
        modal.innerHTML = `
    <div class="leaderboard-header">
        <h2>Leaderboard</h2>
        <div class="toggle-container">
            <button id="toggle-score" class="toggle active">Score</button>
            <button id="toggle-streak" class="toggle">Streak</button>
        </div>
    </div>
    <div class="leaderboard-top" id="top-3">
        <!-- Top 3 players will be dynamically injected here -->
    </div>
    <div class="leaderboard-list" id="leaderboard-list">
        <!-- Remaining leaderboard items will be dynamically injected here -->
    </div>
    <button id="close-leaderboard" class="modal-close">Close</button>
`;

        document.body.appendChild(modal);

        // Close modal
        document.getElementById("close-leaderboard").addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Event listeners for toggles
        document.getElementById("toggle-score").addEventListener("click", () => {
            document.getElementById("toggle-score").classList.add("active");
            document.getElementById("toggle-streak").classList.remove("active");

            // Load Score leaderboard
            loadLeaderboardData("score");
        });

        document.getElementById("toggle-streak").addEventListener("click", () => {
            document.getElementById("toggle-streak").classList.add("active");
            document.getElementById("toggle-score").classList.remove("active");

            // Load Streak leaderboard
            loadLeaderboardData("streak");
        });
    }

    // Function to update the top 3 users
    function updateTopThree(users) {
        const positions = ['second', 'first', 'third'];
        const topContainer = document.getElementById('top-3');
        topContainer.innerHTML = ''; // Clear existing content
    
        users.forEach((user, index) => {
            const userDiv = document.createElement('div');
            userDiv.className = `top-user ${positions[index]}`;
            userDiv.innerHTML = `
                <img src="${user.avatar}" alt="${user.name}">
                <div class="name">${user.name}</div>
                <div class="score">${user.score}</div>
            `;
            topContainer.appendChild(userDiv);
        });
    }
    function updateTopThree(topThree) {
        const topContainer = document.getElementById("top-3");
        topContainer.innerHTML = ""; // Clear any existing content
    
        const positions = ["second", "first", "third"];
        topThree.forEach((user, index) => {
            const userElement = document.createElement("div");
            userElement.classList.add("top-user", positions[index]);
    
            userElement.innerHTML = `
                <img src="${user.avatar || 'assets/default-user.png'}" alt="${user.name}">
                <div class="name">${user.name}</div>
                <div class="score">${user.score}</div>
            `;
            topContainer.appendChild(userElement);
        });
    }
    
    

    
    

    // Load initial leaderboard data
    loadLeaderboardData("score");

    // Add the `updateTopThree` function as a callback to `loadLeaderboardData`
    window.updateTopThree = updateTopThree;

    // Display the modal
    modal.style.display = "block";
}




async function loadLeaderboardData(metric) {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy(metric, "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No matching documents.");
            return;
        }

        const users = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                name: data.name || "Anonymous", // Use stored name or fallback
                avatar: data.avatar || "assets/default-user.png", // Use stored avatar or fallback
                score: data.score || 0,
                streak: data.streak || 0,
            });
        });

        // Sort users by selected metric
        users.sort((a, b) => b[metric] - a[metric]);

        // Separate top three and remaining users
        const topThree = users.slice(0, 3);
        const others = users.slice(3);

        // Update top three
        updateTopThree(topThree);

        // Update leaderboard list
        updateLeaderboardList(others, metric);
    } catch (error) {
        console.error("Error loading leaderboard data:", error);
    }
}


// Function to update the top three users
function updateTopThree(topThree) {
    const topContainer = document.getElementById("top-3");
    topContainer.innerHTML = ""; // Clear any existing content

    const positions = ["first", "second", "third"];
    topThree.forEach((user, index) => {
        const userElement = document.createElement("div");
        userElement.classList.add("top-user", positions[index]);

        userElement.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" />
            <div class="name">${user.name}</div>
            <div class="score">${user.score}</div>
        `;
        topContainer.appendChild(userElement);
    });
}
// Function to update the remaining leaderboard list
function updateLeaderboardList(others, metric) {
    const listContainer = document.getElementById("leaderboard-list");
    listContainer.innerHTML = ""; // Clear any existing content

    others.forEach((user, index) => {
        const userElement = document.createElement("div");
        userElement.classList.add("leaderboard-item");

        userElement.innerHTML = `
            <span class="rank">${index + 4}</span>
            <img src="${user.avatar || 'assets/default-user.png'}" alt="${user.name}" class="avatar">
            <div class="user-info">
                <span class="username">${user.name}</span>
                <span class="user-score">${user[metric]}</span>
            </div>
        `;
        listContainer.appendChild(userElement);
    });
}
