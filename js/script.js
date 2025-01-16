// Part 1: Firebase Initialization and Google Login
import { signInWithPopup } from "./js/firebase.js";
import { saveScore, fetchScore } from "./js/scoring.js";
import { auth, provider, db, collection, doc, getDocs, setDoc, getDoc } from "./js/firebase.js";

let currentUser = null;

// Initialize Google Login
function googleLogin() {
    signInWithPopup(auth, provider)
        .then((result) => {
            // Get user information
            const user = result.user;
            currentUser = user;
            
            // Display user icon
            const userIcon = document.getElementById("user-icon");
            userIcon.style.backgroundImage = `url(${user.photoURL})`;
            
            // Hide Google Login button
            document.getElementById("google-login-container").style.display = "none";

            // Fetch or initialize user score
            initializeUserScore(user.uid);
        })
        .catch((error) => {
            console.error("Error during Google login:", error);
        });
}

// Initialize user score in Firestore if not already present
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

// Event listener for Google login
document.getElementById("google-login").addEventListener("click", googleLogin);

// Part 2: Loading the Random Image
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

// Load a random image from Firestore
async function loadRandomImage() {
    try {
        const imagesCollection = collection(db, "images");
        const imagesSnapshot = await getDocs(imagesCollection);
        const images = [];

        // Collect all images into an array
        imagesSnapshot.forEach((doc) => {
            images.push({ id: doc.id, ...doc.data() });
        });

        // Select a random image
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




// Part 2: Loading the Random Image
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

// Load a random image from Firestore
async function loadRandomImage() {
    try {
        const imagesCollection = collection(db, "images");
        const imagesSnapshot = await getDocs(imagesCollection);
        const images = [];

        // Collect all images into an array
        imagesSnapshot.forEach((doc) => {
            images.push({ id: doc.id, ...doc.data() });
        });

        // Select a random image
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

// Display the random image in the placeholder
function displayRandomImage(imageData) {
    const randomPersonElement = document.getElementById("random-person");
    randomPersonElement.style.backgroundImage = `url(${imageData.url})`;
    randomPersonElement.dataset.imageId = imageData.id; // Store the image ID for later use
}

// Call the function to load the image when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadRandomImage();
});




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
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user; // Set current user globally
        updateUserIcon(user); // Update user icon
    }
});





// Part 5: Menu Button and Modal Handling
// Select all modal elements and the menu button
const modals = {
    leaderboard: document.getElementById("leaderboard-modal"),
    uploads: document.getElementById("uploads-modal"),
    userInfo: document.getElementById("user-info-modal"),
    settings: document.getElementById("settings-modal"),
    logout: document.getElementById("logout-modal"),
};

const menuIcon = document.getElementById("menu-icon");

// Open the specified modal
function openModal(modalName) {
    if (modals[modalName]) {
        modals[modalName].style.display = "block";
    } else {
        console.error(`Modal "${modalName}" does not exist.`);
    }
}

// Close all modals
function closeAllModals() {
    Object.values(modals).forEach((modal) => {
        modal.style.display = "none";
    });
}

// Menu icon event listener
menuIcon.addEventListener("click", () => {
    const menuDropdown = document.createElement("div");
    menuDropdown.classList.add("menu-dropdown");

    menuDropdown.innerHTML = `
        <ul>
            <li data-modal="leaderboard">Leaderboard</li>
            <li data-modal="uploads">Image Uploads</li>
            <li data-modal="userInfo">User Info</li>
            <li data-modal="settings">Settings</li>
            <li data-modal="logout">Logout</li>
        </ul>
    `;

    document.body.appendChild(menuDropdown);

    // Add event listeners for dropdown items
    menuDropdown.querySelectorAll("li").forEach((item) => {
        item.addEventListener("click", (e) => {
            const modalName = e.target.getAttribute("data-modal");
            openModal(modalName);
            menuDropdown.remove(); // Remove dropdown after selection
        });
    });

    // Close the dropdown if clicked outside
    document.addEventListener("click", (e) => {
        if (!menuDropdown.contains(e.target) && e.target !== menuIcon) {
            menuDropdown.remove();
        }
    }, { once: true });
});

// Add close buttons for each modal
Object.entries(modals).forEach(([modalName, modalElement]) => {
    const closeButton = modalElement.querySelector(".close-modal");
    if (closeButton) {
        closeButton.addEventListener("click", closeAllModals);
    }
});





// Part 6: Login Page and Redirection
document.addEventListener("DOMContentLoaded", () => {
    const loginPage = document.getElementById("login-page");
    const mainContent = document.getElementById("main-content");

    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is logged in, show main content
            currentUser = user;
            updateUserIcon(user);
            loginPage.style.display = "none";
            mainContent.style.display = "block";
        } else {
            // User is not logged in, show login page
            loginPage.style.display = "flex";
            mainContent.style.display = "none";
        }
    });
});
