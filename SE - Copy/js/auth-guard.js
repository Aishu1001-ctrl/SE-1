// auth-guard.js
// This file should be imported on all protected pages

function validateSession() {
    const token = localStorage.getItem('userToken');
    const loginTime = localStorage.getItem('loginTime');
    
    if (!token || !loginTime) {
        // No token or login time found
        redirectToLogin();
        return false;
    }
    
    // Check if token has expired (1 hour expiry)
    const expiryTime = 60 * 60 * 1000; // 1 hour in milliseconds
    const currentTime = Date.now();
    
    if (currentTime - parseInt(loginTime) > expiryTime) {
        // Token expired
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('loginTime');
        redirectToLogin();
        return false;
    }
    
    // Token is valid
    return true;
}

function redirectToLogin() {
    alert('Your session has expired or you are not logged in. Please log in again.');
    window.location.href = 'index.html';
}

// Function to logout user
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('loginTime');
    window.location.href = 'index.html';
}

export { validateSession, logout };