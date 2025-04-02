import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    deleteDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged,
    deleteUser,
    signOut,
    EmailAuthProvider,
    reauthenticateWithCredential
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

// Function to calculate total score
const calculateTotalScore = (scores) => {
    return scores ? 
        Object.values(scores).reduce((sum, score) => sum + score, 0) 
        : 0;
};

// Function to safely update element text
const safeUpdateElementText = (elementId, text) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text || "N/A";
    }
};

// Function to get user details and rank
const fetchUserProfile = async (userId) => {
    try {
        // Fetch current user's document
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Calculate total score
            const totalScore = calculateTotalScore(userData.scores);

            // Fetch all users to determine global rank
            const usersCollection = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollection);
            
            // Calculate rank based on total score
            const userScores = [];
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                const score = calculateTotalScore(data.scores);
                userScores.push({
                    id: doc.id,
                    score: score
                });
            });

            // Sort users by score in descending order
            userScores.sort((a, b) => b.score - a.score);

            // Find current user's rank
            const rank = userScores.findIndex(u => u.id === userId) + 1;

            // Safely update user details
            safeUpdateElementText("userName", userData.name);
            safeUpdateElementText("userEmail", userData.email);
            safeUpdateElementText("userRank", rank.toString());
            safeUpdateElementText("userHighscore", totalScore.toString());

            // Display level-wise scores
            const scoresContainer = document.getElementById("levelScores");
            if (scoresContainer) {
                scoresContainer.innerHTML = ""; // Clear previous scores
                if (userData.scores) {
                    Object.entries(userData.scores).forEach(([level, score]) => {
                        const scoreEntry = document.createElement("div");
                        scoreEntry.className = "level-score";
                        scoreEntry.textContent = `Level ${level}: ${score}`;
                        scoresContainer.appendChild(scoreEntry);
                    });
                } else {
                    scoresContainer.textContent = "No level scores available";
                }
            }
            
            // Store user data in localStorage for edit page
            localStorage.setItem('currentUserName', userData.name);
            localStorage.setItem('currentUserEmail', userData.email);
        } else {
            console.error("User document not found");
            alert("User profile not found!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Provide more detailed error handling
        safeUpdateElementText("userName", "Error");
        safeUpdateElementText("userEmail", "Error");
        safeUpdateElementText("userRank", "Error");
        safeUpdateElementText("userHighscore", "Error");

        // Show error to user
        const scoresContainer = document.getElementById("levelScores");
        if (scoresContainer) {
            scoresContainer.innerHTML = `<div class="error-message">Failed to load profile: ${error.message}</div>`;
        }
    }
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserProfile(user.uid);
    } else {
        alert("No user logged in!");
        window.location.href = "signup.html"; // Redirect to login page if no user is logged in
    }
});

// Redirect to edit profile page
window.editProfile = function() {
    window.location.href = "change.html";
};

// Delete profile from Firebase
window.deleteProfile = async function() {
    const user = auth.currentUser;
    if (user) {
        const confirmDelete = confirm("Are you sure you want to delete your profile? This cannot be undone.");
        if (confirmDelete) {
            // Show reauthentication modal
            document.getElementById('reauthModal').style.display = 'block';
            
            // Set up the form submission handler
            document.getElementById('reauthForm').onsubmit = async (e) => {
                e.preventDefault();
                const password = document.getElementById('reauthPassword').value;
                
                try {
                    // Create credential
                    const credential = EmailAuthProvider.credential(user.email, password);
                    
                    // Reauthenticate user
                    await reauthenticateWithCredential(user, credential);
                    
                    // Delete Firestore document
                    await deleteDoc(doc(db, "users", user.uid));
                    
                    // Delete Authentication user
                    await deleteUser(user);
                    
                    // Sign out and clear local storage
                    await signOut(auth);
                    localStorage.clear();
                    
                    alert("Profile deleted successfully!");
                    window.location.href = "register.html";
                } catch (error) {
                    console.error("Error deleting profile:", error);
                    document.getElementById('reauthError').textContent = 
                        error.code === 'auth/wrong-password' 
                            ? 'Incorrect password. Please try again.' 
                            : `Error: ${error.message}`;
                }
            };
        }
    }
};

// Close modal when user clicks the close button or outside the modal
window.closeModal = function() {
    document.getElementById('reauthModal').style.display = 'none';
    document.getElementById('reauthPassword').value = '';
    document.getElementById('reauthError').textContent = '';
};

// Close modal if user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('reauthModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Logout functionality
window.logout = async function() {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = "signup.html";
    } catch (error) {
        console.error("Logout error:", error);
        alert("Failed to log out. Please try again.");
    }
};