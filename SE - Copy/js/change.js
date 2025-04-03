import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged,
    updateEmail
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPDA9APsTXZOY1xpzlDZsS6u3hgFK-3OU",
    authDomain: "se01-6c41d.firebaseapp.com",
    projectId: "se01-6c41d",
    storageBucket: "se01-6c41d.firebasestorage.app",
    messagingSenderId: "838786217773",
    appId: "1:838786217773:web:30be0a8376d0e87d86c5a4",
    measurementId: "G-BMZD314T0M"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// DOM elements
const editNameInput = document.getElementById('editName');
const editEmailInput = document.getElementById('editEmail');
const editProfileForm = document.getElementById('edit-profile-form');
const cancelBtn = document.getElementById('cancel-btn');
const backBtn = document.getElementById('back-btn');
const updateMessage = document.getElementById('update-message');
const errorMessage = document.getElementById('error-message');

// Load user data from localStorage or Firebase
const loadUserData = async () => {
    try {
        // First try to get from localStorage (set in profile.js)
        let userName = localStorage.getItem('currentUserName');
        let userEmail = localStorage.getItem('currentUserEmail');
        
        // If not in localStorage, fetch from Firebase
        if (!userName || !userEmail) {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    userName = userData.name;
                    userEmail = userData.email;
                }
            }
        }
        
        // Populate form fields
        if (userName) editNameInput.value = userName;
        if (userEmail) editEmailInput.value = userEmail;
    } catch (error) {
        console.error("Error loading user data:", error);
        showError("Failed to load user data. Please try again.");
    }
};

// Save profile changes
const saveProfileChanges = async (event) => {
    event.preventDefault();
    
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("No user logged in");
        }
        
        const newName = editNameInput.value.trim();
        const newEmail = editEmailInput.value.trim();
        
        // Update Firestore document
        const userRef = doc(db, "users", user.uid);
        
        // Check if email changed
        if (newEmail !== user.email) {
            // Update Auth email
            await updateEmail(user, newEmail);
        }
        
        // Update Firestore data
        await updateDoc(userRef, {
            name: newName,
            email: newEmail
        });
        
        // Update localStorage
        localStorage.setItem('currentUserName', newName);
        localStorage.setItem('currentUserEmail', newEmail);
        
       
        showUpdateMessage();
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = "profile.html";
        }, 2000);
    } catch (error) {
        console.error("Error updating profile:", error);
        showError(error.message || "Failed to update profile. Please try again.");
    }
};


const showUpdateMessage = () => {
    updateMessage.style.display = "block";
    errorMessage.style.display = "none";
};

// Show error message
const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    updateMessage.style.display = "none";
};


const navigateToProfile = () => {
    window.location.href = "profile.html";
};


document.addEventListener('DOMContentLoaded', () => {
    // Load user data when page loads
    loadUserData();
    
    
    editProfileForm.addEventListener('submit', saveProfileChanges);
    
    
    cancelBtn.addEventListener('click', navigateToProfile);
    
  
    backBtn.addEventListener('click', navigateToProfile);
});

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        
        window.location.href = "signup.html";
    }
});