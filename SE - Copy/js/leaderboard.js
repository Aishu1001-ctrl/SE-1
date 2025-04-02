document.addEventListener("DOMContentLoaded", function() {
    let leaderboard = [
        { name: "Alice", score: 100 },
        { name: "Bob", score: 80 },
        { name: "Charlie", score: 60 }
    ];

    let leaderboardList = document.getElementById("leaderboard");
    leaderboard.forEach(player => {
        let li = document.createElement("li");
        li.textContent = `${player.name} - ${player.score} points`;
        leaderboardList.appendChild(li);
    });
});
