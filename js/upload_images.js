import { db, doc, setDoc } from "./firebase.js";

export function initializeUploadImagesModal() {
    let modal = document.getElementById("upload-modal");
    if (!modal) {
        // Dynamically create the modal if it doesn't exist
        modal = document.createElement("div");
        modal.id = "upload-modal";
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.width = "400px";
        modal.style.padding = "20px";
        modal.style.backgroundColor = "#fff";
        modal.style.borderRadius = "10px";
        modal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        modal.style.zIndex = "1000";

        modal.innerHTML = `
        <div id="upload-modal" class="modal">

    <h2 style="text-align: center;">Upload an Image</h2>
    <form id="upload-form">
        <label for="file-input">Select an Image:</label>
<label for="file-input" class="custom-file-label">Choose File</label>
<input type="file" id="file-input" accept="image/*" required style="display: none;" />
<span id="file-chosen">No file chosen</span>
        <br />
        <label for="first-name">First Name:</label>
        <input type="text" id="first-name" required />
        <br />
        <label for="last-name">Last Name:</label>
        <input type="text" id="last-name" required />
        <br />
        <button type="submit" class="btn-primary">Upload</button>
    </form>
    <button id="close-upload" class="btn-secondary">Close</button>
    </div>
`;


        document.body.appendChild(modal);
    }
    document.getElementById("file-input").addEventListener("change", function () {
        const fileChosen = document.getElementById("file-chosen");
        fileChosen.textContent = this.files[0] ? this.files[0].name : "No file chosen";
    });
    
    // Show the modal
    modal.style.display = "block";

    // Close modal event
    const closeButton = modal.querySelector("#close-upload");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // Handle image upload
    const uploadForm = modal.querySelector("#upload-form");
    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const fileInput = document.getElementById("file-input");
            const firstNameInput = document.getElementById("first-name");
            const lastNameInput = document.getElementById("last-name");

            const file = fileInput.files[0];
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();

            if (!file || !firstName || !lastName) {
                alert("Please fill out all fields and select an image.");
                return;
            }

            try {
                console.log("Uploading image:", file);

                // Upload image to Cloudinary
                const imageUrl = await uploadImageToCloudinary(file);

                console.log("Image uploaded successfully. Saving metadata...");
                // Save metadata to Firestore
                await saveMetadataToFirestore(imageUrl, firstName, lastName);

                alert("Image and metadata saved successfully!");
            } catch (error) {
                console.error("Error during upload process:", error);
                alert("Failed to upload image or save metadata.");
            }
        });
    }
}

// Cloudinary Upload API
async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "NameDrop"); // Make sure this matches exactly
    formData.append("folder", "namedrop"); // Folder name in Cloudinary

    console.log("Uploading to Cloudinary with:", formData);

    try {
        const response = await fetch(
            "https://api.cloudinary.com/v1_1/mrlilholt/image/upload",
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();
        console.log("Cloudinary response:", data);

        if (response.ok) {
            console.log("Upload successful:", data.secure_url);
            return data.secure_url;
        } else {
            console.error("Cloudinary upload error:", data.error.message);
            throw new Error(`Upload failed: ${data.error.message}`);
        }
    } catch (error) {
        console.error("Error during Cloudinary upload:", error);
        throw error;
    }
}

// Save metadata to Firestore
async function saveMetadataToFirestore(imageUrl, firstName, lastName) {
    try {
        const id = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now()}`;
        const docRef = doc(db, "images", id);

        console.log("Saving metadata to Firestore:", { id, imageUrl, firstName, lastName });

        await setDoc(docRef, { imageUrl, firstName, lastName });

        console.log("Metadata saved successfully:", id);
    } catch (error) {
        console.error("Error saving metadata to Firestore:", error);
        throw new Error("Failed to save metadata");
    }
}
