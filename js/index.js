document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginform");
    const errorMessage = document.getElementById("error-message");
    
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            // Verify token expiration
            const decoded = jwt_decode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp > currentTime) {
                // Token is still valid, redirect to game
                window.location.href = "play.html";
            } else {
                // Token expired, remove it
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            // Invalid token, remove it
            localStorage.removeItem('authToken');
            console.error("Invalid token:", error);
        }
    }
    
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission behavior
        
        // Perform basic validation
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (username === "" || password === "") {
            errorMessage.textContent = "Please enter both username and password.";
            return;
        }
        
        // In a real application, you would send these credentials to a server
        // Since we don't have a server, we'll create a simple client-side validation
        
        // Demo users (in a real app, this would be on the server)
        const validUsers = [
            { username: "demo", password: "password" },
            { username: "user", password: "pass123" }
        ];
        
        // Check if credentials match any valid user
        const user = validUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Create a simple JWT token (normally done on server)
            const payload = {
                sub: username,
                name: username,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            };
            
            // Convert payload to base64
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payloadBase64 = btoa(JSON.stringify(payload));
            
            // In a real application, the signature would be cryptographically secure
            // This is just a placeholder for demonstration
            const signature = btoa(username + Date.now());
            
            // Create token string
            const token = `${header}.${payloadBase64}.${signature}`;
            
            // Store JWT token
            localStorage.setItem('authToken', token);
            
            // Redirect to game page
            window.location.href = "play.html";
        } else {
            // Show error message
            errorMessage.textContent = "Invalid username or password.";
        }
    });
});