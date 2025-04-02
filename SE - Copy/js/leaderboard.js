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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function loadLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = ""; // Clear existing entries

    try {
        // Fetch all users
        const usersSnapshot = await db.collection('users').get();
        
        // Calculate total scores for each user
        const userScores = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const totalScore = userData.scores ? 
                Object.values(userData.scores).reduce((sum, score) => sum + score, 0) 
                : 0;
            
            // Only add users with scores
            if (totalScore > 0) {
                userScores.push({
                    name: userData.name || 'Anonymous', // Use name if available
                    totalScore: totalScore
                });
            }
        });

        // Sort users by total score in descending order
        userScores.sort((a, b) => b.totalScore - a.totalScore);

        // Add ranked entries to leaderboard
        userScores.forEach((user, index) => {
            const entry = document.createElement("div");
            entry.classList.add("entry");
            entry.innerHTML = `
                <span>${index + 1}</span> 
                <span>${user.name}</span> 
                <span>${user.totalScore}</span>
            `;
            leaderboardList.appendChild(entry);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardList.innerHTML = "<div>Error loading leaderboard</div>";
    }
}

// Load leaderboard on page load
window.onload = loadLeaderboard;