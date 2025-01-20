// script.js

// Part 1: Firebase Initialization and Google Login
import { auth, provider, signInWithPopup, db, collection, doc, getDocs, setDoc, getDoc } from "./firebase.js";
import { saveScore, fetchScore } from "./scoring.js";
import { initializeUploadImagesModal } from "./upload_images.js";
import { initializeProfileModal } from "./userinfo.js";
import { initializeSettingsModal } from "./settings.js";
import { initializeLeaderboardModal } from "./leaderboard.js";


let currentUser = null;

// Initialize Google Login
const googleLoginButton = document.getElementById("google-login");
const loginContainer = document.getElementById("login-container");
const mainApp = document.querySelector("main");

// Google login button click handler
// Attach googleLogin to the global window object
window.googleLogin = async function () {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Logged in as:", user);

        // Hide the login container and show the main app
        const loginContainer = document.getElementById("login-container");
        const mainContainer = document.getElementById("main-container");

        if (loginContainer && mainContainer) {
            loginContainer.style.display = "none";
            mainContainer.style.display = "block";
        }

        // Update user profile picture
        const userIcon = document.getElementById("user-icon");
        if (userIcon) {
            userIcon.style.backgroundImage = `url(${user.photoURL})`;
        }

        // Initialize the user's score in Firestore
        initializeUserScore(user.uid);
    } catch (error) {
        console.error("Error during Google login:", error);
    }
};


// Initialize user score in Firestore
async function initializeUserScore(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Initialize new user data only if the document doesn't exist
            await setDoc(userRef, { score: 0, streak: 0 });
        } else {
            const data = userDoc.data();
            sessionScore = data.score || 0; // Fetch the existing score
            sessionStreak = data.streak || 0; // Fetch the existing streak
        }
    } catch (error) {
        console.error("Error initializing user score:", error);
    }
}



// Part 4: User Profile Icon Population
function updateUserIcon(user) {
    const userIcon = document.getElementById("user-icon");

    if (user && user.photoURL) {
        // Set the user icon to the Google profile picture
        userIcon.style.backgroundImage = `url(${user.photoURL})`;
        userIcon.title = user.displayName; // Add a tooltip with the user's name
    } else {
        // Set a default placeholder if no profile picture exists
        userIcon.style.backgroundImage = `url('assets/default-user.png')`;
        userIcon.title = "Guest";
    }
}

// Ensure user icon is updated after Google login

;

// Assuming `user` is the authenticated user object
async function saveUserToFirestore(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Set default values for a new user
            await setDoc(userRef, {
                name: user.displayName || "Anonymous",
                avatar: user.photoURL || "assets/default-user.png",
                score: 0,
                streak: 0,
            });
        } else {
            const data = userDoc.data();
            sessionScore = data.score || 0; // Keep the existing score
            sessionStreak = data.streak || 0; // Keep the existing streak
        }
        console.log("User saved to Firestore:", user.uid);
    } catch (error) {
        console.error("Error saving user to Firestore:", error);
    }
}


// Example: Call this function after a successful login
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;

        // Fetch user data from Firestore
        const userData = await fetchUserData(user.uid);
        sessionScore = userData.score;
        sessionStreak = userData.streak;

        // Update UI with fetched data
        document.querySelector("#score-section .score-container:nth-child(1) span").textContent = sessionStreak;
        document.querySelector("#score-section .score-container:nth-child(2) span").textContent = sessionScore;
    }
});


//Part 4.5 RANDOS

// Function to fetch and display a random image from Firestore
async function loadRandomImage() {
    try {
        // Access the Firestore 'images' collection
        const imagesCollection = collection(db, "images");
        const imagesSnapshot = await getDocs(imagesCollection);
        const gifContainer = document.getElementById("gif-container");
        if (!gifContainer) {
            const newGifContainer = document.createElement("div");
            newGifContainer.id = "gif-container";
            randomPerson.appendChild(newGifContainer);
        }
        const images = [];
        imagesSnapshot.forEach((doc) => {
            images.push({ id: doc.id, ...doc.data() });
        });

        if (images.length > 0) {
            // Pick a random image
            const randomImage = images[Math.floor(Math.random() * images.length)];

            // Update the placeholder with the random image
            const randomPersonElement = document.getElementById("random-person");
            randomPersonElement.style.backgroundImage = `url(${randomImage.imageUrl})`;
            randomPersonElement.dataset.imageId = randomImage.id; // Store image ID for later use
        } else {
            console.error("No images found in Firestore.");
        }
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Load a random image when the page loads
document.addEventListener("DOMContentLoaded", loadRandomImage);

// Event listener for the submit button
document.getElementById("submit-button").addEventListener("click", validateNameInput);


//Part 4.6 NAME INPUT

// Function to validate user input against Firestore data
async function validateNameInput() {
    const firstNameInput = document.getElementById("first-input").value.trim().toLowerCase();
    const lastNameInput = document.getElementById("last-input").value.trim().toLowerCase();
    const nameToggle = document.getElementById("name-toggle").checked;

    const randomPersonElement = document.getElementById("random-person");
    const imageId = randomPersonElement.dataset.imageId; // Get the image ID

    if (!imageId) {
        console.error("No image loaded.");
        return;
    }

    try {
        // Fetch the specific document from Firestore
        const imageRef = doc(db, "images", imageId);
        const imageDoc = await getDoc(imageRef);

        if (!imageDoc.exists()) {
            console.error("Image not found in Firestore.");
            return;
        }

        const { firstName, lastName } = imageDoc.data();

        let isCorrect = false;
        if (nameToggle) {
            // Validate both first and last name
            isCorrect = firstNameInput === firstName.toLowerCase() && lastNameInput === lastName.toLowerCase();
        } else {
            // Validate first name only
            isCorrect = firstNameInput === firstName.toLowerCase();
        }

        if (isCorrect) {
            console.log("Correct!");
            const points = nameToggle ? 2 : 1; // Assign 2 points for both names, 1 point for first name only
            const randomMessage = getRandomSuccessMessage(); // Get a random success message
            showSuccessGif(randomMessage); // Display the success GIF and message
            await updateScores(true, points); // Pass points to the updateScores function
            setTimeout(() => loadRandomImage(), 2000); // Load a new random image after delay
        } else {
            console.log("Incorrect!");
            await updateScores(false, 0); // Reset streak, no points
        }
    } catch (error) {
        console.error("Error validating name input:", error);
    }
}


//Part 4.7 SCORES and STREAKS

// Define success messages globally
const successMessages = [
    "You crushed it!",
    "Amazing!",
    "Way to go!",
    "Keep it up!",
    "You're on fire!",
    "Outstanding performance!",
    "You're unstoppable!",
    "Legendary move!",
    "You’re a rockstar!",
    "Champion vibes only!",
    "You nailed it!",
    "Pure brilliance!",
    "Bravo!",
    "Epic win!",
    "Masterpiece in motion!",
    "Absolute genius!",
    "Superb!",
    "Unbelievable!",
    "Phenomenal effort!",
    "Top-notch work!",
    "You’re a game-changer!",
    "Incredible energy!",
    "Total domination!",
    "Stellar performance!",
    "Excellence defined!",
    "You're untouchable!",
    "Breathtaking work!",
    "Power level: Maximum!",
    "You’re on another level!",
    "Next-level awesome!",
    "Simply the best!",
    "Legend status achieved!",
    "Smashing success!",
    "Dynamic brilliance!",
    "You’re a powerhouse!",
    "Elite skills!",
    "Pure magic!",
    "You're electrifying!",
    "Unreal talent!",
    "Mind-blowing effort!",
    "Supreme focus!",
    "Exceptional brilliance!",
    "Victory is yours!",
    "You're blazing trails!",
    "Fearless and flawless!",
    "Out of this world!",
    "Bold and brilliant!",
    "You make it look easy!",
    "Genius at work!",
    "You’re on fire!",
    "Limitless potential!",
    "Massive achievement!",
    "Brightest star in the galaxy!",
    "You’re a natural!",
    "Dominating the game!",
    "You’re lightning fast!",
    "Breakthrough brilliance!",
    "You’re invincible!",
    "Killing it!",
    "You’re an inspiration!",
    "Radiating awesomeness!",
    "Nothing can stop you!",
    "Heroic effort!",
    "Unmatched greatness!",
    "You’re a trailblazer!",
    "Jaw-dropping success!",
    "Clutch performance!",
    "Absolute perfection!",
    "Larger than life!",
    "You’re a legend in the making!",
    "The MVP!",
    "Skyrocketing to the top!",
    "Dream team material!",
    "Rewriting the rules!",
    "Game-changer energy!",
    "Pro-level skills!",
    "Undeniable talent!",
    "You’re untamed brilliance!",
    "Excellence unlocked!",
    "Master of the moment!",
    "Pure awesomeness!",
    "You’re dominating!",
    "Flawless execution!",
    "Going above and beyond!",
    "Peak performance!",
    "Unstoppable force!",
    "Glorious achievement!",
    "Superhuman effort!",
    "Absolutely phenomenal!",
    "Victory dance worthy!",
    "You’re the GOAT!",
    "Earning all the applause!",
    "Record-breaking success!",
    "Making history!",
    "Reaching new heights!",
    "Taking the world by storm!",
    "Setting the bar high!",
    "True inspiration!",
    "Boundless brilliance!",
    "Absolutely smashing it!"
];


function getRandomSuccessMessage() {
    return successMessages[Math.floor(Math.random() * successMessages.length)];
}

function showSuccessGif(message) {
    const gifContainer = document.getElementById("gif-container");
    const successText = document.getElementById("success-text");

    if (!gifContainer || !successText) {
        console.error("GIF container or success text element not found");
        return;
    }

    // Set the success message
    successText.textContent = message;

    // Show the GIF container
    gifContainer.style.display = "flex";

    // Hide the GIF container after 3 seconds
    setTimeout(() => {
        gifContainer.style.display = "none";
    }, 3000);
}

// Example integration with the submit button
document.getElementById("submit-button").addEventListener("click", () => {
    // Check if the answer is correct
    const isCorrect = checkAnswer(); // Replace with your logic for validation
    console.log("Is the answer correct?", isCorrect);

    if (isCorrect) {
        const randomMessage = getRandomSuccessMessage();
        console.log("Displaying success message:", randomMessage);
        showSuccessGif(randomMessage); // Show GIF and success message

        // Add a delay before loading the next random image
        setTimeout(() => {
            console.log("Loading new random image...");
            loadRandomImage();
        }, 2000); // 2-second delay
    } else {
        console.log("Incorrect!");
    }
});



// Skip button logic
document.getElementById("skip-button").addEventListener("click", () => {
    loadRandomImage(); // Load a new random image without updating scores
    console.log("Skipped to the next image!");
});

// Ensure skip button is correctly initialized
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("skip-button").disabled = false; // Enable skip button
});






async function updateScores(isCorrect, points = 1) {
    if (!currentUser) {
        console.error("No user logged in.");
        return;
    }

    const userId = currentUser.uid;
    const userRef = doc(db, "users", userId);

    try {
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.error("User document not found.");
            return;
        }

        const { score, streak } = userDoc.data();
        const newScore = isCorrect ? score + points : score;
        const newStreak = isCorrect ? streak + 1 : 0;

        // Update Firestore with the new score and streak
        await setDoc(userRef, { score: newScore, streak: newStreak }, { merge: true });

        // Update UI
        document.querySelector("#score-section .score-container:nth-child(1) span").textContent = newStreak; // Streak
        document.querySelector("#score-section .score-container:nth-child(2) span").textContent = newScore;  // Score
    } catch (error) {
        console.error("Error updating scores:", error);
    }
}



document.getElementById("name-toggle").addEventListener("change", (event) => {
    const lastNameInput = document.getElementById("last-input");

    if (event.target.checked) {
        // Show the last name input
        lastNameInput.style.display = "block";
    } else {
        // Hide the last name input
        lastNameInput.style.display = "none";
        lastNameInput.value = ""; // Clear the last name input value
    }
});


// Part 5: Menu Button and Modal Handling

// Toggle Sidebar
const menuIcon = document.getElementById("menu-icon");
const menuSidebar = document.getElementById("menu-sidebar");

menuIcon.addEventListener("click", () => {
    menuSidebar.classList.toggle("active");
});

// Add Event Listeners for Modals
document.querySelectorAll("#menu-list li").forEach((menuItem) => {
    const modalType = menuItem.getAttribute("data-modal");
    menuItem.addEventListener("click", () => {
        if (modalType === "leaderboard") initializeLeaderboardModal();
        if (modalType === "upload") initializeUploadImagesModal();
        if (modalType === "profile") initializeProfileModal();
        if (modalType === "settings") initializeSettingsModal();
    });
});

// Handle Logout
const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", () => {
    auth.signOut().then(() => {
        location.reload(); // Redirect to login
    });
});

// Update User Info in Sidebar
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("menu-avatar").src = user.photoURL || "assets/default-avatar.png";
        document.getElementById("menu-username").textContent = user.displayName || "User";
    }
});




// Part 6: Login Page and Redirection
document.addEventListener("DOMContentLoaded", () => {
    // Ensure the main app is hidden initially
    const mainApp = document.getElementById("main-container");
    if (mainApp) {
        mainApp.style.display = "none";
    }

    // Load a random image
    loadRandomImage();

    // Check authentication state
    auth.onAuthStateChanged((user) => {
        const loginContainer = document.getElementById("login-container");
        const mainContainer = document.getElementById("main-container");

        if (user) {
            // User is logged in
            console.log("User is logged in:", user);
            currentUser = user;

            if (loginContainer && mainContainer) {
                loginContainer.style.display = "none";
                mainContainer.style.display = "block";
            }

            // Update user icon
            updateUserIcon(user);

            // Initialize user's score
            initializeUserScore(user.uid);
        } else {
            // User is not logged in
            if (loginContainer && mainContainer) {
                loginContainer.style.display = "flex";
                mainContainer.style.display = "none";
            }
        }
    });
});
async function fetchUserData(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return {
            score: data.score || 0,
            streak: data.streak || 0,
        };
    } else {
        // If user doesn't exist, initialize data
        await setDoc(userRef, { score: 0, streak: 0 });
        return { score: 0, streak: 0 };
    }
}
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userData = await fetchUserData(user.uid);

        // Initialize session variables with fetched data
        sessionScore = userData.score;
        sessionStreak = userData.streak;
    } else {
        // Save session data to Firestore before logout
        await updateUserData(auth.currentUser.uid, sessionScore, sessionStreak);

        // Clear session variables
        sessionScore = 0;
        sessionStreak = 0;
    }
});

async function updateUserData(userId, newScore, newStreak) {
    const userRef = doc(db, "users", userId);

    try {
        await db.runTransaction(async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                const updatedScore = (data.score || 0) + newScore;
                const updatedStreak = (data.streak || 0) + newStreak;

                transaction.update(userRef, { score: updatedScore, streak: updatedStreak });
            } else {
                transaction.set(userRef, { score: newScore, streak: newStreak });
            }
        });
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}
