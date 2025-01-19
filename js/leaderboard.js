import { db } from "./firebase.js"; // Ensure the path is correct
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";

export async function loadLeaderboardData() {
    try {
        const usersRef = collection(db, "users"); // Reference to 'users' collection
        const q = query(usersRef, orderBy("score", "desc"), limit(10)); // Query top 10 scores
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No leaderboard data found.");
            return [];
        }

        const leaderboard = [];
        snapshot.forEach((doc) => {
            leaderboard.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return leaderboard;
    } catch (error) {
        console.error("Error loading leaderboard data:", error);
        throw error;
    }
}
