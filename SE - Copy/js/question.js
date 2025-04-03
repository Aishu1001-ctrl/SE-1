// Timer Countdown
let timeLeft = 10;
const timerElement = document.getElementById("timer");

function startTimer() {
    let timerInterval = setInterval(function () {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Try again.");
            window.location.reload();
        }
        timerElement.innerText = timeLeft;
        timeLeft--;
    }, 1000);
}

window.onload = startTimer;


function goBack() {
    window.history.back();
}


function closeGame() {
    window.location.href = "play.html"; 
}


function checkAnswer() {
    const userAnswer = document.getElementById("userAnswer").value.trim();
    const correctAnswer = "10"; 

    if (userAnswer === correctAnswer) {
        alert("Correct answer! 🎉");
        window.location.href = "next-level.html";
    } else {
        document.getElementById("errorMessage").innerHTML = 
            '<span style="color:red;">❌ Incorrect answer, <a href="#" onclick="retry()">Try again</a></span>';
    }
}


function retry() {
    document.getElementById("errorMessage").innerHTML = "";
    document.getElementById("userAnswer").value = "";
}
