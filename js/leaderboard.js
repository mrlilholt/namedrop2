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
                <!-- Top 3 will be dynamically populated -->
            </div>
            <div class="leaderboard-list" id="leaderboard-list"></div>
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
    function updateTopThree(topThree) {
        const top3Container = document.getElementById("top-3");
    
        // Debugging to verify input
        console.log("Top Three Data:", topThree);
    
        top3Container.innerHTML = `
            <div class="leaderboard-item second">
                <img src="${topThree[1]?.avatar || './assets/default-user.png'}" alt="${topThree[1]?.name || 'Anonymous'}" class="avatar">
                <img src="assets/second.png" alt="Second Place" class="badge">
                <div>${topThree[1]?.name || 'Anonymous'} ${topThree[1]?.score || 0}</div>
            </div>
            <div class="leaderboard-item first">
                <img src="${topThree[0]?.avatar || './assets/default-user.png'}" alt="${topThree[0]?.name || 'Anonymous'}" class="avatar">
                <img src="assets/first.png" alt="First Place" class="badge">
                <div>${topThree[0]?.name || 'Anonymous'} ${topThree[0]?.score || 0}</div>
            </div>
            <div class="leaderboard-item third">
                <img src="${topThree[2]?.avatar || 'assets/default-user.png'}" alt="${topThree[2]?.name || 'Anonymous'}" class="avatar">
                <img src="assets/third.png" alt="Third Place" class="badge">
                <div>${topThree[2]?.name || 'Anonymous'} ${topThree[2]?.score || 0}</div>
            </div>
        `;
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
