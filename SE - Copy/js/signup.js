// Import Firebase modules from the CDN 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// web app's Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Handle sign-up form submission
document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("⚠️ Please fill in all fields.");
        return;
    }

    try {
        // 🔥 Firebase Authentication - Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🔥 Update User Profile with Name
        await updateProfile(user, { displayName: name });

        // 🔥 Store User in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            createdAt: new Date().toISOString()
        });

        alert("✅ Account created successfully!");
        window.location.href = "index.html"; // Redirect to login page

    } catch (error) {
        console.error("Firebase Error:", error);

        // 🔴 Error Handling (Custom Messages)
        if (error.code === "auth/email-already-in-use") {
            alert("⚠️ This email is already in use. Try logging in.");
        } else if (error.code === "auth/weak-password") {
            alert("⚠️ Password should be at least 6 characters.");
        } else if (error.code === "auth/invalid-email") {
            alert("⚠️ Invalid email format. Please enter a valid email.");
        } else {
            alert("⚠️ Error: " + error.message);
        }
    }
});
