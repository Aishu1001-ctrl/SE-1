// Game Configuration
const config = {
    maxLevels: 10,
    initialTime: 60,
    timeDecrease: 5,
    initialScore: 0,
    pointsPerCorrectAnswer: 1
};

// Game State
let gameState = {
    currentLevel: 1,
    score: 0,
    levelScore: 0, // New property to track score per level
    timeLeft: config.initialTime,
    currentCountry: "",
    timer: null,
    userId: null,
    isTimerPaused: false,
    progressCounter: 1,
    maxAttemptsPerLevel: 3,
    countries: [],
    hintShowing: false,
    correctAnswersInLevel: 0
};

// DOM Elements
const elements = {
    level: document.getElementById("level"),
    score: document.getElementById("score"),
    progress: document.getElementById("progress"),
    timer: document.getElementById("timer"),
    countryFlag: document.getElementById("country-flag"),
    answerInput: document.getElementById("userAnswer"),
    errorMsg: document.getElementById("errorMessage"),
    submitBtn: document.getElementById("submit-btn"),
    closeBtn: document.getElementById("close-btn"),
    backBtn: document.getElementById("back-btn"),
    exitBtn: document.getElementById("exit-btn"),
    leaderboardBtn: document.getElementById("leaderboard-btn"),
    profileBtn: document.getElementById("profile-btn"),
    hintBtn: document.getElementById("hint-btn"),
    bananaModal: document.getElementById("banana-modal"),
    bananaImage: document.getElementById("banana-image"),
    bananaAnswerInput: document.getElementById("banana-answer"),
    bananaSubmit: document.getElementById("banana-submit"),
    bananaResult: document.getElementById("banana-result"),
    hintModal: document.getElementById("hint-modal"),
    hintText: document.getElementById("hint-text"),
    closeHintBtn: document.getElementById("close-hint-btn"),
    closeButtons: document.querySelectorAll(".close")
};

// API Endpoints
const API_URL = "https://restcountries.com/v3.1/all";

// Initialize the game
function initGame() {
    updateUI();
    fetchAllCountries();
    startTimer();
    setupEventListeners();
}

// Update UI elements
function updateUI() {
    elements.level.textContent = gameState.currentLevel;
    elements.score.textContent = gameState.levelScore; // Display level score instead of total
    elements.timer.textContent = gameState.timeLeft;
    elements.progress.textContent = `${gameState.progressCounter}/${gameState.maxAttemptsPerLevel}`;
}

// Fetch all countries
async function fetchAllCountries() {
    try {
        const response = await fetch(API_URL);
        gameState.countries = await response.json();
        getNewCountry();
    } catch (error) {
        console.error("Error fetching country data:", error);
    }
}

// Get a new country
function getNewCountry() {
    const randomIndex = Math.floor(Math.random() * gameState.countries.length);
    gameState.currentCountry = gameState.countries[randomIndex].name.common.toLowerCase();
    elements.countryFlag.src = gameState.countries[randomIndex].flags.png;
    elements.progress.textContent = `${gameState.progressCounter}/${gameState.maxAttemptsPerLevel}`;
    elements.errorMsg.innerHTML = "";
    elements.answerInput.value = "";
    displayCountryNameLetters();
}

// Display country name as asterisks
function displayCountryNameLetters() {
    const nameWithAsterisks = '*'.repeat(gameState.currentCountry.length);
    elements.answerInput.placeholder = `Guess the country: ${nameWithAsterisks}`;
}

// Start the game timer
function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);

    gameState.timeLeft = Math.max(config.initialTime - (gameState.currentLevel - 1) * config.timeDecrease, 15);
    elements.timer.textContent = gameState.timeLeft;

    gameState.timer = setInterval(() => {
        if (!gameState.isTimerPaused) { // Only decrement if the timer is not paused
            gameState.timeLeft--;
            elements.timer.textContent = gameState.timeLeft;

            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timer);
                handleTimeUp();
            }
        }
    }, 1000);
}

// Pause the timer
function pauseTimer() {
    gameState.isTimerPaused = true;
}

// Resume the timer
function resumeTimer() {
    gameState.isTimerPaused = false;
}

// Handle when time is up
function handleTimeUp() {
    elements.errorMsg.textContent = "⏳ Time's up!";
    elements.errorMsg.style.color = "red";
    elements.answerInput.disabled = true;
    elements.submitBtn.disabled = true;
    
    // Provide option to retry or go back after timeout
    setTimeout(() => {
        if (confirm("Time's up! Would you like to try again?")) {
            resetLevel();
        } else {
            goBack();
        }
    }, 1500);
}

// Reset the current level
function resetLevel() {
    elements.answerInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.errorMsg.innerHTML = "";
    elements.answerInput.value = "";
    gameState.progressCounter = 1;
    gameState.correctAnswersInLevel = 0;
    gameState.levelScore = 0; // Reset level score
    getNewCountry();
    startTimer();
    updateUI();
}

// Show hint for the current country
function showHint() {
    pauseTimer();
    gameState.hintShowing = true;
    
    // Generate hint based on the current country
    const country = gameState.currentCountry;
    let hint = `The country's name starts with "${country[0].toUpperCase()}".`;
    
    // Additional hints based on country properties
    const countryData = gameState.countries.find(c => c.name.common.toLowerCase() === country);
    if (countryData) {
        if (countryData.region) {
            hint += ` It's located in ${countryData.region}.`;
        }
        if (countryData.capital && countryData.capital.length > 0) {
            hint += ` The capital is ${countryData.capital[0]}.`;
        }
    }
    
    // Display the hint
    elements.hintText.textContent = hint;
    elements.hintModal.style.display = "block";
}

// Close the hint modal
function closeHint() {
    elements.hintModal.style.display = "none";
    gameState.hintShowing = false;
    resumeTimer();
}

// Check the player's answer
function checkAnswer() {
    const playerAnswer = elements.answerInput.value.toLowerCase().trim();
    const correctAnswer = gameState.currentCountry.toLowerCase();

    if (playerAnswer === correctAnswer) {
        gameState.score += config.pointsPerCorrectAnswer;
        gameState.levelScore += config.pointsPerCorrectAnswer; // Update level score
        elements.score.textContent = gameState.levelScore; // Display level score
        gameState.correctAnswersInLevel++;

        elements.errorMsg.textContent = "✅ Correct!";
        elements.errorMsg.style.color = "green";

        // Move to next flag or complete level
        setTimeout(() => {
            moveToNextFlag();
        }, 1500);
    } else {
        elements.errorMsg.textContent = "❌ Incorrect. Try again!";
        elements.errorMsg.style.color = "red";
        
        setTimeout(() => {
            elements.errorMsg.innerHTML = "";
            // Move to next flag in the level after incorrect answer
            moveToNextFlag();
        }, 1500);
    }
}

// Move to next flag in the current level
function moveToNextFlag() {
    gameState.progressCounter++;
    
    if (gameState.progressCounter > gameState.maxAttemptsPerLevel) {
        // If completed all attempts for this level, show banana challenge
        clearInterval(gameState.timer);
        
        // Save the current level's score to Firestore before showing banana challenge
        if (gameState.userId) {
            saveScore(gameState.userId, gameState.currentLevel, gameState.levelScore);
        }
        
        showBananaChallenge();
    } else {
        // Otherwise, continue with this level
        getNewCountry();
        updateUI();
    }
}

// Function to fetch Banana question from API
const fetchBananaQuestion = async () => {
    let retries = 3; // Number of retries
    while (retries > 0) {
        try {
            const response = await fetch("https://marcconrad.com/uob/banana/api.php");
            if (!response.ok) {
                throw new Error("Failed to fetch banana question.");
            }

            const data = await response.json();
            console.log("Banana API Response:", data); // Debugging

            // Ensure the response contains the required fields
            if (!data.solution || !data.question) {
                throw new Error("Invalid API response: missing fields.");
            }

            // Always convert solution to string before using toLowerCase()
            const solution = String(data.solution);

            // Set the image source using the 'question' field
            elements.bananaImage.src = data.question;

            return solution;
        } catch (error) {
            console.error("Error fetching banana question:", error);
            retries--;
            if (retries === 0) {
                alert("Failed to fetch banana question. Please try again later.");
                return "";
            }
        }
    }
};

// Show banana challenge after completing a level
async function showBananaChallenge() {
    // Reset any previous results
    elements.bananaResult.classList.add("hidden");
    elements.bananaAnswerInput.value = "";
    
    const solution = await fetchBananaQuestion();
    if (solution) {
        // Ensure solution is a string and then set it as lowercase
        elements.bananaSubmit.dataset.solution = String(solution).toLowerCase();
        elements.bananaModal.style.display = "block";
    } else {
        alert("Failed to load challenge. Moving to next level.");
        advanceToNextLevel();
    }
}

// Handle banana challenge completion
function handleBananaCompletion() {
    // Reset progress counter for the next level
    gameState.progressCounter = 1;
    gameState.correctAnswersInLevel = 0;
    
    // Advance to the next level
    advanceToNextLevel();
}

// Advance to the next level
function advanceToNextLevel() {
    if (gameState.currentLevel >= config.maxLevels) {
        endGame();
        return;
    }

    gameState.currentLevel++;
    elements.answerInput.value = "";
    elements.answerInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.errorMsg.innerHTML = "";
    
    // Reset level score for the new level
    gameState.levelScore = 0;

    updateUI();
    getNewCountry();
    startTimer();
}

// End the game
function endGame() {
    clearInterval(gameState.timer);
    
    // Save the final score to Firestore
    if (gameState.userId) {
        saveScore(gameState.userId, gameState.currentLevel, gameState.levelScore);
    }
    
    alert(`🎉 Congratulations! You've completed all levels!\nFinal Score: ${gameState.score}`);
    goBack();
}

// Save score to Firestore (updated for Firestore v9 modular API)
async function saveScore(userId, level, levelScore) {
    try {
        // Import Firestore functions (these are available globally from the HTML script)
        const { doc, getDoc, setDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js");
        
        // Get a reference to the user document
        const userDocRef = doc(window.db, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            // Create a new document for the user
            await setDoc(userDocRef, {
                scores: {
                    [level]: levelScore
                },
                highestLevel: level,
                totalScore: levelScore,
                lastPlayed: new Date().toISOString()
            });
        } else {
            // Get existing data
            const userData = docSnap.data();
            const scores = userData.scores || {};
            const existingLevelScore = scores[level] || 0;
            const highestLevel = Math.max(userData.highestLevel || 0, level);
            
            // Update the score for the current level if it's better
            if (levelScore > existingLevelScore) {
                scores[level] = levelScore;
            } else if (!scores[level]) {
                // If no score exists for this level, add it even if it's 0
                scores[level] = levelScore;
            }
            
            // Calculate total score by summing up all level scores
            let totalScore = 0;
            for (const [lvl, score] of Object.entries(scores)) {
                totalScore += score;
            }
            
            const updates = {
                scores: scores,
                highestLevel: highestLevel,
                totalScore: totalScore,
                lastPlayed: new Date().toISOString()
            };
            
            await updateDoc(userDocRef, updates);
        }
        console.log("Score saved successfully");
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

// Go back to previous page
function goBack() {
    window.location.href = "../index.html";
}

// Navigate to leaderboard
function goToLeaderboard() {
    window.location.href = "../leaderboard.html";
}

// Navigate to profile
function goToProfile() {
    window.location.href = "../profile.html";
}

// Setup event listeners
function setupEventListeners() {
    // Hint button
    elements.hintBtn.addEventListener("click", showHint);
    elements.closeHintBtn.addEventListener("click", closeHint);
    
    // Answer input focus
    elements.answerInput.addEventListener("focus", () => {
        // When user clicks on answer input and hint is showing, close the hint
        if (gameState.hintShowing) {
            closeHint();
        }
    });
    
    // Handle banana answer submission
    elements.bananaSubmit.addEventListener("click", () => {
        const userAnswer = elements.bananaAnswerInput.value.trim().toLowerCase();
        const correctAnswer = elements.bananaSubmit.dataset.solution;

        if (userAnswer === correctAnswer) {
            elements.bananaResult.textContent = "🎉 Correct! Moving to next level!";
            elements.bananaResult.classList.remove("hidden");
            
            setTimeout(() => {
                elements.bananaModal.style.display = "none";
                elements.bananaAnswerInput.value = ""; // Clear input for next time
                elements.bananaResult.classList.add("hidden");
                handleBananaCompletion();
            }, 1500);
        } else {
            elements.bananaResult.textContent = "❌ Incorrect. Try again!";
            elements.bananaResult.classList.remove("hidden");
            
            setTimeout(() => {
                elements.bananaResult.classList.add("hidden");
            }, 1500);
        }
    });

    // Close modal buttons
    elements.closeButtons.forEach(closeBtn => {
        closeBtn.addEventListener("click", () => {
            closeBtn.closest(".modal").style.display = "none";
            if (closeBtn.closest(".modal") === elements.hintModal) {
                gameState.hintShowing = false;
                resumeTimer();
            } else if (closeBtn.closest(".modal") === elements.bananaModal) {
                handleBananaCompletion();
            }
        });
    });

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
            if (event.target === elements.hintModal) {
                gameState.hintShowing = false;
                resumeTimer();
            } else if (event.target === elements.bananaModal) {
                handleBananaCompletion();
            }
        }
    };

    // Submit answer button
    elements.submitBtn.addEventListener("click", checkAnswer);
    
    // Enter key in answer input
    elements.answerInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") checkAnswer();
    });
    
    // Enter key in banana answer input
    elements.bananaAnswerInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            elements.bananaSubmit.click();
        }
    });
    
    // Navigation buttons
    elements.backBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
            // Save progress before exiting
            if (gameState.userId) {
                saveScore(gameState.userId, gameState.currentLevel, gameState.levelScore);
            }
            goBack();
        }
    });
    
    elements.closeBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
            // Save progress before exiting
            if (gameState.userId) {
                saveScore(gameState.userId, gameState.currentLevel, gameState.levelScore);
            }
            goBack();
        }
    });
    
    elements.exitBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
            // Save progress before exiting
            if (gameState.userId) {
                saveScore(gameState.userId, gameState.currentLevel, gameState.levelScore);
            }
            goBack();
        }
    });
    
    elements.leaderboardBtn.addEventListener("click", goToLeaderboard);
    elements.profileBtn.addEventListener("click", goToProfile);
    
    // Check if user is logged in using Firebase Auth v9
    const checkUserAuth = async () => {
        if (typeof window.auth !== 'undefined') {
            window.auth.onAuthStateChanged(user => {
                if (user) {
                    gameState.userId = user.uid;
                    console.log("User logged in:", user.uid);
                } else {
                    console.log("No user logged in");
                }
            });
        } else {
            console.warn("Firebase Auth not initialized");
        }
    };
    
    checkUserAuth();
}

// Start the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initGame);