import { db, getDocs, collection } from "./firebase.js";

export function initializeLeaderboardModal() {
    const modal = document.createElement("div");
    modal.id = "leaderboard-modal";
    modal.classList.add("modal");
    modal.style.display = "none"; // Initially hidden
    modal.innerHTML = `
        <div class="leaderboard-header">
            <h2>Leaderboard</h2>
            <div class="toggle-container">
                <button id="toggle-score" class="toggle active">Score</button>
                <button id="toggle-streak" class="toggle">Streak</button>
            </div>
        </div>
        <div class="leaderboard-top">
            <div id="top-3"></div>
        </div>
        <div class="leaderboard-list" id="leaderboard-list"></div>
        <button id="close-leaderboard" class="modal-close">Close</button>
    `;

    document.body.appendChild(modal);

    // Close leaderboard
    document.getElementById("close-leaderboard").addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Event listeners for toggle
    document.getElementById("toggle-score").addEventListener("click", () => {
        loadLeaderboardData("score");
    });

    document.getElementById("toggle-streak").addEventListener("click", () => {
        loadLeaderboardData("streak");
    });

    // Load initial leaderboard data
    loadLeaderboardData("score");

    return modal;
}

// Function to fetch and display leaderboard data
async function loadLeaderboardData(metric) {
    try {
        const usersRef = db.collection("users");
const snapshot = await usersRef.orderBy("score", "desc").limit(10).get();
if (snapshot.empty) {
    console.log("No matching documents.");
    return;
}
snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
});


        // Sort users by selected metric
        users.sort((a, b) => b[metric] - a[metric]);

        // Update top 3
        updateTopThree(users.slice(0, 3), metric);

        // Update leaderboard list
        const listContainer = document.getElementById("leaderboard-list");
        listContainer.innerHTML = users
            .slice(3) // Skip top 3
            .map((user, index) => `
                <div class="leaderboard-item">
                    <span class="rank">${index + 4}</span>
                    <img src="${user.avatar}" alt="${user.name}" class="avatar">
                    <div class="user-info">
                        <span class="username">${user.name}</span>
                        <span class="user-score">${user[metric]}</span>
                    </div>
                </div>
            `)
            .join("");
    } catch (error) {
        console.error("Error loading leaderboard data:", error);
    }
}

function updateTopThree(topThree, metric) {
    const topContainer = document.getElementById("top-3");
    topContainer.innerHTML = topThree
        .map((user, index) => `
            <div class="top-player ${index === 1 ? "gold" : index === 0 ? "silver" : "bronze"}">
                <img src="${user.avatar}" alt="${user.name}" class="avatar">
                <div class="user-info">
                    <span class="username">${user.name}</span>
                    <span class="user-score">${user[metric]}</span>
                </div>
            </div>
        `)
        .join("");
}
