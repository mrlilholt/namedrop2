// script.js

// Part 1: Firebase Initialization and Google Login
import { auth, provider, signInWithPopup, db, collection, doc, getDocs, setDoc, getDoc } from "./firebase.js";
import { saveScore, fetchScore } from "./scoring.js";
import { initializeUploadImagesModal } from "./upload_images.js";
import { initializeProfileModal } from "./userinfo.js";
import { initializeSettingsModal } from "./settings.js";

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
            await setDoc(userRef, { score: 0, streak: 0 });
        }
    } catch (error) {
        console.error("Error initializing user score:", error);
    }
}

// Part 2: Loading Random Image
async function loadRandomImage() {
    try {
        const imagesCollection = collection(db, "images");
        const imagesSnapshot = await getDocs(imagesCollection);
        const images = [];

        imagesSnapshot.forEach((doc) => {
            images.push({ id: doc.id, ...doc.data() });
        });

        if (images.length > 0) {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            displayRandomImage(randomImage);
        } else {
            console.error("No images found in Firestore.");
        }
    } catch (error) {
        console.error("Error loading random image:", error);
    }
}

// Display the random image
function displayRandomImage(imageData) {
    const randomPersonElement = document.getElementById("random-person");
    randomPersonElement.style.backgroundImage = `url(${imageData.url})`;
    randomPersonElement.dataset.imageId = imageData.id;
}

// Call the function to load the image when the page loads
document.addEventListener("DOMContentLoaded", loadRandomImage);


// Part 3: Submitting First/Last Name
async function submitName() {
    const firstNameInput = document.getElementById("first-input").value.trim().toLowerCase();
    const lastNameInput = document.getElementById("last-input").value.trim().toLowerCase();
    const randomPersonElement = document.getElementById("random-person");
    const imageId = randomPersonElement.dataset.imageId;

    if (!imageId) {
        console.error("No image loaded.");
        return;
    }

    try {
        // Fetch the image data from Firestore
        const imageRef = doc(db, "images", imageId);
        const imageDoc = await getDoc(imageRef);

        if (!imageDoc.exists()) {
            console.error("Image not found in Firestore.");
            return;
        }

        const { firstName, lastName } = imageDoc.data();

        // Check if the input matches
        if (firstNameInput === firstName.toLowerCase() && lastNameInput === lastName.toLowerCase()) {
            updateScores(true);
            loadRandomImage(); // Load a new random image
        } else {
            updateScores(false);
        }
    } catch (error) {
        console.error("Error validating name submission:", error);
    }
}

// Update scores and streaks
async function updateScores(isCorrect) {
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
        const newScore = isCorrect ? score + 1 : score;
        const newStreak = isCorrect ? streak + 1 : 0;

        // Update Firestore with the new score and streak
        await setDoc(userRef, { score: newScore, streak: newStreak }, { merge: true });

        // Update UI
        document.querySelector(".score-container span").textContent = newScore;
        document.querySelector("#streak-container span").textContent = newStreak;
    } catch (error) {
        console.error("Error updating scores:", error);
    }
}

// Event listener for the Submit button
document.getElementById("submit-button").addEventListener("click", submitName);




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


//Part 4.5 RANDOS

// Function to fetch and display a random image from Firestore
async function loadRandomImage() {
    try {
        // Access the Firestore 'images' collection
        const imagesCollection = collection(db, "images");
        const imagesSnapshot = await getDocs(imagesCollection);

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

//Part 4.6 NAME INPUT

// Function to validate user input against Firestore data
async function validateNameInput() {
    const firstNameInput = document.getElementById("first-input").value.trim().toLowerCase();
    const lastNameInput = document.getElementById("last-input").value.trim().toLowerCase();

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

        // Check if the input matches
        if (firstNameInput === firstName.toLowerCase() && lastNameInput === lastName.toLowerCase()) {
            console.log("Correct!");
            updateScores(true); // Update the score and streak
            loadRandomImage(); // Load a new random image
        } else {
            console.log("Incorrect!");
            updateScores(false); // Reset streak and leave score unchanged
        }
    } catch (error) {
        console.error("Error validating name input:", error);
    }
}

//Part 4.7 SCORES and STREAKS

// Function to update score and streak
async function updateScores(isCorrect) {
    const userId = auth.currentUser?.uid; // Get current user ID
    if (!userId) {
        console.error("No user logged in.");
        return;
    }

    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.error("User document not found.");
            return;
        }

        const { score = 0, streak = 0 } = userDoc.data();
        const newScore = isCorrect ? score + 1 : score;
        const newStreak = isCorrect ? streak + 1 : 0;

        // Update Firestore with new score and streak
        await setDoc(userRef, { score: newScore, streak: newStreak }, { merge: true });

        // Update UI
        document.querySelector(".score-container span").textContent = newScore;
        document.querySelector("#streak-container span").textContent = newStreak;
    } catch (error) {
        console.error("Error updating scores:", error);
    }
}


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

