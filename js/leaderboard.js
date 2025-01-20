import { db, collection, query, orderBy, getDocs } from "./firebase.js";

export function initializeLeaderboardModal() {
    const leaderboardModal = document.createElement("div");
    leaderboardModal.id = "leaderboard-modal";
    leaderboardModal.style.position = "fixed";
    leaderboardModal.style.top = "50%";
    leaderboardModal.style.left = "50%";
    leaderboardModal.style.transform = "translate(-50%, -50%)";
    leaderboardModal.style.width = "400px";
    leaderboardModal.style.padding = "20px";
    leaderboardModal.style.backgroundColor = "#fff";
    leaderboardModal.style.borderRadius = "10px";
    leaderboardModal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
    leaderboardModal.style.zIndex = "1000";
    
    modal.id = "leaderboard-modal";
    modal.classList.add("modal");
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

    // Close the modal
    document.getElementById("close-leaderboard").addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Set up toggle buttons
    document.getElementById("toggle-score").addEventListener("click", () => {
        loadLeaderboardData("score");
    });
    document.getElementById("toggle-streak").addEventListener("click", () => {
        loadLeaderboardData("streak");
    });

    // Load initial data
    loadLeaderboardData("score");
    return modal;
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
                name: data.name || "Anonymous",
                avatar: data.avatar || "assets/default-user.png",
                score: data.score || 0,
                streak: data.streak || 0,
            });
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
            <div class="top-player ${index === 0 ? "gold" : index === 1 ? "silver" : "bronze"}">
                <img src="${user.avatar}" alt="${user.name}" class="avatar">
                <div class="user-info">
                    <span class="username">${user.name}</span>
                    <span class="user-score">${user[metric]}</span>
                </div>
            </div>
        `)
        .join("");
}
