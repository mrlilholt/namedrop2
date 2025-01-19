import { db, collection, getDocs, query, orderBy } from "./firebase.js";

export async function initializeLeaderboardModal() {
    const leaderboardModal = document.getElementById("leaderboard-modal");
    if (!leaderboardModal) {
        console.error("Leaderboard modal not found");
        return;
    }

    // Clear previous leaderboard data
    const leaderboardContent = leaderboardModal.querySelector(".leaderboard-content");
    leaderboardContent.innerHTML = "<p>Loading leaderboard data...</p>";

    try {
        // Load leaderboard data
        const leaderboardData = await loadLeaderboardData();
        
        // Render leaderboard
        renderLeaderboard(leaderboardContent, leaderboardData);
    } catch (error) {
        console.error("Error loading leaderboard data:", error);
        leaderboardContent.innerHTML = "<p>Error loading leaderboard data.</p>";
    }

    // Show modal
    leaderboardModal.style.display = "block";

    // Close button
    const closeButton = leaderboardModal.querySelector("#close-leaderboard");
    closeButton.addEventListener("click", () => {
        leaderboardModal.style.display = "none";
    });
}

async function loadLeaderboardData() {
    try {
        // Reference Firestore collection
        const usersCollection = collection(db, "users");

        // Query Firestore for leaderboard data, ordering by score descending
        const leaderboardQuery = query(usersCollection, orderBy("score", "desc"));
        const querySnapshot = await getDocs(leaderboardQuery);

        const leaderboardData = [];
        querySnapshot.forEach((doc) => {
            leaderboardData.push({ id: doc.id, ...doc.data() });
        });

        return leaderboardData;
    } catch (error) {
        console.error("Error loading leaderboard data:", error);
        throw error;
    }
}

function renderLeaderboard(container, data) {
    // Sort and slice top 3 for featured users
    const topThree = data.slice(0, 3);
    const others = data.slice(3);

    // Render top 3 users
    const topThreeHtml = topThree
        .map(
            (user, index) => `
        <div class="top-user">
            <p>#${index + 1}: ${user.nickname || user.name || "Anonymous"}</p>
            <p>Score: ${user.score || 0}</p>
        </div>`
        )
        .join("");

    // Render others
    const othersHtml = others
        .map(
            (user, index) => `
        <div class="other-user">
            <p>#${index + 4}: ${user.nickname || user.name || "Anonymous"}</p>
            <p>Score: ${user.score || 0}</p>
        </div>`
        )
        .join("");

    container.innerHTML = `
        <div class="top-three">
            ${topThreeHtml}
        </div>
        <hr />
        <div class="others">
            ${othersHtml}
        </div>
    `;
}
