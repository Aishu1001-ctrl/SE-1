// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
const auth = getAuth(app);

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Basic validation
        if (!email || !password) {
            alert('Please fill in both email and password fields');
            return;
        }

        try {
            // Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Get ID token (JWT) from Firebase
            const idToken = await user.getIdToken();
            
            // Store token in localStorage for session management
            localStorage.setItem('userToken', idToken);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userId', user.uid);
            localStorage.setItem('loginTime', Date.now());
            
            // Successful login
            console.log('JWT token created and stored in localStorage');
            alert('Successfully logged in!');
            window.location.href = 'play.html';

        } catch (error) {
            // Enhanced error handling
            handleLoginError(error);
        }
    });

    // Check if user is already logged in
    checkUserSession();
});

// Check user session function
function checkUserSession() {
    const token = localStorage.getItem('userToken');
    const loginTime = localStorage.getItem('loginTime');
    
    if (token && loginTime) {
        // Define session expiry time (e.g., 1 hour)
        const expiryTime = 60 * 60 * 1000; // 1 hour in milliseconds
        const currentTime = Date.now();
        
        if (currentTime - parseInt(loginTime) < expiryTime) {
            // Session is still valid
            console.log('Valid session found');
            // Redirect to main page if user is already on login page
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                window.location.href = 'play.html';
            }
        } else {
            // Session expired, clear localStorage
            console.log('Session expired');
            localStorage.removeItem('userToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('loginTime');
        }
    }
}

// Error Handling Function
function handleLoginError(error) {
    const errorMap = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'Account disabled',
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many attempts - try again later',
        'auth/network-request-failed': 'Network error - check connection',
        'auth/missing-password': 'Missing password',
        'auth/missing-email': 'Missing email'
    };

    const errorMessage = errorMap[error.code] || `Login failed: ${error.message}`;
    alert(errorMessage);
    
    // Optional: Clear password field on error
    document.getElementById('password').value = '';
}