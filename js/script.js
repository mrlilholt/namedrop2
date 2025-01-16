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
document.getElementById("google-login").addEventListener("click", async () => {
    try {
        // Sign in with Firebase
        const result = await signInWithPopup(auth, provider);

        // Extract user info
        const user = result.user;
        console.log("Logged in as:", user);

        // Hide the login container and show the main app container
        const loginContainer = document.getElementById("login-container");
        const mainContainer = document.getElementById("main-container");

        if (loginContainer && mainContainer) {
            loginContainer.style.display = "none";
            mainContainer.style.display = "block";
        } else {
            console.error("Login or Main container is missing in the DOM.");
        }

        // Update user profile picture in the app
        const userIcon = document.getElementById("user-icon");
        if (userIcon) {
            userIcon.style.backgroundImage = `url(${user.photoURL})`;
        }

    } catch (error) {
        console.error("Error during Google login:", error);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    mainApp.style.display = "none"; // Ensure the main app is hidden initially
});


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

// Event listener for Google login
document.getElementById("google-login").addEventListener("click", googleLogin);

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
auth.onAuthStateChanged((user) => {
    if (user) {
        // Hide login and show main content
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-container").style.display = "block";

        // Populate user icon
        const userIcon = document.getElementById("user-icon");
        if (userIcon) {
            userIcon.style.backgroundImage = `url(${user.photoURL})`;
            userIcon.style.backgroundSize = "cover";
        }
    } else {
        // Show login and hide main content
        document.getElementById("login-container").style.display = "flex";
        document.getElementById("main-container").style.display = "none";
    }
});






// Part 5: Menu Button and Modal Handling
// Initialize an empty modals object
const modals = {
    profile: null,
    upload: null,
    settings: null,
};

// Function to register a modal
function registerModal(name, element) {
    modals[name] = element;
}
// Select all modal elements and the menu button
import { initializeProfileModal } from "./userinfo.js";
import { initializeUploadModal } from "./upload_images.js";
import { initializeSettingsModal } from "./settings.js";

// Register modals dynamically
document.addEventListener("DOMContentLoaded", () => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        modal.classList.remove("active"); // Ensure they are hidden on load
    });

    // Add functionality to open and close modals
    document.querySelectorAll("[data-modal-open]").forEach(button => {
        button.addEventListener("click", () => {
            const targetModal = document.querySelector(button.dataset.modalOpen);
            if (targetModal) {
                targetModal.classList.add("active");
            }
        });
    });

    document.querySelectorAll("[data-modal-close]").forEach(button => {
        button.addEventListener("click", () => {
            const targetModal = button.closest(".modal");
            if (targetModal) {
                targetModal.classList.remove("active");
            }
        });
    });
});


// Initialize modals when menu options are clicked
// Handle menu clicks
document.getElementById("menu-icon").addEventListener("click", () => {
    const menuOptions = `
        <div id="menu-options" style="position: absolute; top: 50px; right: 20px; background: white; border: 1px solid #ccc; border-radius: 8px; padding: 10px; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);">
            <button id="open-settings">Settings</button>
            <button id="open-userinfo">User Info</button>
            <button id="open-upload">Upload Image</button>
            <button id="logout">Logout</button>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", menuOptions);

    // Attach event listeners for the menu options
    document.getElementById("open-settings").addEventListener("click", () => {
        initializeSettingsModal(); // Assuming `initializeSettingsModal` is imported from `settings.js`
    });
    document.getElementById("open-userinfo").addEventListener("click", () => {
        initializeUserInfoModal(); // Assuming you have a similar function in `userinfo.js`
    });
    document.getElementById("open-upload").addEventListener("click", () => {
        initializeUploadImagesModal(); // Assuming you have a similar function in `upload_images.js`
    });
    document.getElementById("logout").addEventListener("click", () => {
        auth.signOut();
        document.getElementById("menu-options").remove();
    });

    // Add event listeners for menu items
    menuDropdown.querySelectorAll("li").forEach((item) => {
        item.addEventListener("click", (e) => {
            const modalType = e.target.getAttribute("data-modal");

            // Initialize and open the respective modal
            switch (modalType) {
                case "profile":
                    initializeProfileModal();
                    break;
                case "upload":
                    initializeUploadModal();
                    break;
                case "settings":
                    initializeSettingsModal();
                    break;
                default:
                    console.error(`Unknown modal type: ${modalType}`);
            }

            // Close menu options on clicking outside
    document.addEventListener("click", (event) => {
        if (!event.target.closest("#menu-options") && event.target.id !== "menu-icon") {
            document.getElementById("menu-options").remove();
        }
    }, { once: true });
        });
    });

    // Close dropdown if clicked outside
    document.addEventListener(
        "click",
        (e) => {
            if (!menuDropdown.contains(e.target) && e.target !== document.getElementById("menu-icon")) {
                menuDropdown.remove();
            }
        },
        { once: true }
    );
});

Object.entries(modals).forEach(([modalName, modalElement]) => {
    if (!modalElement) {
        console.warn(`Modal "${modalName}" not found.`);
        return;
    }

    const closeButton = modalElement.querySelector(".close-modal");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            modalElement.style.display = "none";
        });
    } else {
        console.warn(`Close button not found for modal "${modalName}".`);
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
