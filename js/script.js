// script.js

// Part 1: Firebase Initialization and Google Login
import { auth, provider, signInWithPopup, db, collection, doc, getDocs, setDoc, getDoc } from "./firebase.js";
import { saveScore, fetchScore } from "./scoring.js";

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






// Part 5: Menu Button and Modal Handling
// Handle menu icon click

// Function to handle menu icon click
document.getElementById("menu-icon").addEventListener("click", () => {
    // Check if the menu already exists
    let existingMenu = document.getElementById("menu-options");
    if (existingMenu) {
        existingMenu.remove(); // Close the menu if it exists
        return;
    }

    // Create the menu options
    const menuOptions = `
        <div id="menu-options" style="position: absolute; top: 50px; right: 20px; background: white; border: 1px solid #ccc; border-radius: 8px; padding: 10px; box-shadow: 0px 4px 6px rgba(0,0,0,0.1); z-index: 100;">
            <button id="open-upload" style="display: block; margin-bottom: 10px;">Upload Image</button>
            <button id="open-userinfo" style="display: block; margin-bottom: 10px;">User Info</button>
            <button id="open-settings" style="display: block; margin-bottom: 10px;">Settings</button>
            <button id="logout" style="display: block; color: red;">Logout</button>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", menuOptions);

    // Add event listener for Upload Image button
    document.getElementById("open-upload").addEventListener("click", () => {
        initializeUploadImagesModal(); // Call your modal initialization from upload_images.js
        closeMenu();
    });

    // Add event listener for User Info button
    document.getElementById("open-userinfo").addEventListener("click", () => {
        initializeProfileModal(); // Call your modal initialization from userinfo.js
        closeMenu();
    });

    // Add event listener for Settings button
    document.getElementById("open-settings").addEventListener("click", () => {
        initializeSettingsModal(); // Call your modal initialization from settings.js
        closeMenu();
    });

    // Add event listener for Logout button
    document.getElementById("logout").addEventListener("click", () => {
        auth.signOut()
            .then(() => {
                console.log("User logged out");
                location.reload(); // Reload the page to show the login screen
            })
            .catch((error) => {
                console.error("Logout error:", error);
            });
        closeMenu();
    });

    // Close the menu when clicking outside
    document.addEventListener("click", (event) => {
        if (!event.target.closest("#menu-options") && event.target.id !== "menu-icon") {
            closeMenu();
        }
    }, { once: true });
});

// Helper function to close the menu
function closeMenu() {
    const menu = document.getElementById("menu-options");
    if (menu) {
        menu.remove();
    }
}


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

