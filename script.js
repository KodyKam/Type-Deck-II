// DOM Elements
const player1Input = document.getElementById("player1-name");
const player2Input = document.getElementById("player2-name");
const startGameBtn = document.getElementById("start-game");
const gameArea = document.getElementById("game-area");
const playerSetup = document.getElementById("player-setup");
const currentPlayerDisplay = document.getElementById("current-player");
const inputField = document.getElementById("sentence-input");
const timerDisplay = document.getElementById("timer");
const wordCountDisplay = document.getElementById("word-count");
const result = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");
const nextTurnPrompt = document.getElementById("next-turn-prompt");
const turnMessage = document.getElementById("turn-message");
const startTurnBtn = document.getElementById("start-turn-btn");
const inputContainer = document.getElementById("input-container");
const tireScreechSound = new Audio("tireScreech.mp3");
const tickingSound = new Audio("ticking.mp3");
tickingSound.loop = true;
const tiedGameSound = new Audio("tied-game.mp3");
const buzzerSound = new Audio("buzzer.mp3");
const victoryFanfare = new Audio("victoryFanfare.mp3");
const showLeaderboardBtn = document.getElementById("show-leaderboard-btn");

showLeaderboardBtn.addEventListener("click", () => {
  result.innerHTML = ""; // Clear previous result/card if needed
  showLeaderboard();
  document.getElementById("leaderboard").style.display = "block";
});

// Game State
let player1 = "";
let player2 = "";
let currentRound = 1;
let maxRounds = 3;
let currentPlayer = 1;
let playerScores = {
  1: { name: "", words: [], total: 0 },
  2: { name: "", words: [], total: 0 }
};

let timeLeft = 20; // seconds
let timerInterval = null;
let typingStarted = false;

startGameBtn.addEventListener("click", () => {
  player1 = player1Input.value.trim() || "Player 1";
  player2 = player2Input.value.trim() || "Player 2";

  playerScores[1].name = player1;
  playerScores[2].name = player2;

  updatePlayerDisplay();

  playerSetup.style.display = "none";
  gameArea.style.display = "block";
});

function updatePlayerDisplay() {
  currentPlayerDisplay.textContent = `Round ${currentRound} - ${playerScores[currentPlayer].name}'s turn`;
}

function updateWordCount() {
  const sentence = inputField.value;
  const words = sentence.match(/\b\w+\b/g);
  const wordCount = words ? words.length : 0;
  wordCountDisplay.textContent = `Words: ${wordCount}`;
}

function backgroundFade() {
  if (timeLeft > 10) {
    inputField.style.backgroundColor = "";
  } else if (timeLeft > 7) {
    inputField.style.backgroundColor = "#d4af37";
  } else if (timeLeft > 2) {
    inputField.style.backgroundColor = "#ffa500";
  } else {
    inputField.style.backgroundColor = "#8b0000";
  }
}

function startCountdown() {
    timerInterval = setInterval(() => {
      timeLeft -= 1;
      backgroundFade();
  
      // Play ticking sound when time is low
      if (timeLeft <= 7 && timeLeft > 2) {
        if (tickingSound.paused) {
          tickingSound.play();
        }
      } else {
        tickingSound.pause();
        tickingSound.currentTime = 0;
      }
  
      // Play buzzer in final 2 seconds (once)
      if (timeLeft === 2) {
        buzzerSound.play();
      }
  
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        tickingSound.pause();
        tickingSound.currentTime = 0;
  
        timerDisplay.textContent = "Time's up!";
        inputField.disabled = true;
  
        const sentence = inputField.value.trim();
        const words = sentence.match(/\b\w+\b/g);
        const wordCount = words ? words.length : 0;
  
        playerScores[currentPlayer].words.push(wordCount);
        playerScores[currentPlayer].total += wordCount;
  
        showCardImage(wordCount);
  
        setTimeout(() => {
          if (currentPlayer === 1) {
            currentPlayer = 2;
          } else {
            currentPlayer = 1;
            currentRound++;
          }
  
          if (currentRound > maxRounds) {
            displayFinalResult();
            return;
          }
  
          showNextTurnPrompt();
        }, 1000);
      } else {
        timerDisplay.textContent = `Timer: ${timeLeft}s`;
      }
    }, 1000);
  }

inputField.addEventListener("input", () => {
  updateWordCount();

  if (!typingStarted) {
    typingStarted = true;
    tireScreechSound.play();
    startCountdown();
  }
});

resetBtn.addEventListener("click", () => {
  victoryFanfare.pause();
  victoryFanfare.currentTime = 0;
  tickingSound.pause();
  tickingSound.currentTime = 0;
  clearInterval(timerInterval);
  timeLeft = 20;
  typingStarted = false;
  currentPlayer = 1;
  currentRound = 1;

  inputField.value = "";
  inputField.disabled = false;
  inputField.style.backgroundColor = "";

  timerDisplay.textContent = `Timer: ${timeLeft}s`;
  wordCountDisplay.textContent = "Words: 0";
  result.textContent = "";

  gameArea.style.display = "none";
  playerSetup.style.display = "block";
});

function showCardImage(wordCount) {
  let cardValue = "2";

  if (wordCount >= 30) {
    cardValue = "ACE";
  } else if (wordCount >= 20) {
    cardValue = "KING";
  } else if (wordCount >= 15) {
    cardValue = "QUEEN";
  } else if (wordCount >= 1 && wordCount <= 10) {
    cardValue = wordCount.toString();
  }

  if (cardValue === "ACE") {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.textContent = "✨"; // you can swap this with 🎉, 🌟, 💫, etc.
    result.appendChild(sparkle);
  
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }

  const suits = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
  const randomSuit = suits[Math.floor(Math.random() * suits.length)];

  const cardImg = document.createElement("img");
  cardImg.src = `https://deckofcardsapi.com/static/img/${cardValue[0]}${randomSuit[0]}.png`;
  cardImg.alt = `${cardValue} of ${randomSuit}`;
  cardImg.style.width = "200px";
  cardImg.style.marginTop = "10px";
  cardImg.classList.add("card-animation"); //this is the animation class

  result.innerHTML = `<h3>${playerScores[currentPlayer].name} typed ${wordCount} word${wordCount === 1 ? '' : 's'} — your card is ${cardValue} of ${randomSuit}!</h3>`;
  result.appendChild(cardImg);
}

function displayFinalResult() {
  inputField.disabled = true;
  resetBtn.disabled = false;

  const p1 = playerScores[1];
  const p2 = playerScores[2];

  saveToLeaderboard(p1.name, p1.total);
  saveToLeaderboard(p2.name, p2.total);

if (p1.total === p2.total) {
  tiedGameSound.play();
} else {
  victoryFanfare.play();
}

  let resultText = `${p1.name}: ${p1.total} words\n${p2.name}: ${p2.total} words\n\n`;

  if (p1.total > p2.total) {
    resultText += `${p1.name} wins! 🏆`;
    victoryFanfare.play();
  } else if (p2.total > p1.total) {
    resultText += `${p2.name} wins! 🏆`;
    victoryFanfare.play();
  } else {
    resultText += `It's a tie! ⚔️`;
    tiedGameSound.play();
  }

  result.innerHTML = `<h2>${resultText.replace(/\n/g, "<br>")}</h2>`;
}

function showNextTurnPrompt() {
    inputContainer.style.display = "none";
    resetBtn.style.display = "none";
    nextTurnPrompt.style.display = "block";
    turnMessage.textContent = `🎯 ${playerScores[currentPlayer].name}, ready for your turn?`;
  }
  
  startTurnBtn.addEventListener("click", () => {
    nextTurnPrompt.style.display = "none";
    inputContainer.style.display = "block";
    resetBtn.style.display = "inline-block";
    
    inputField.value = "";
    inputField.disabled = false;
    inputField.style.backgroundColor = "";
    typingStarted = false;
    timeLeft = 20;
    updateWordCount();
    updatePlayerDisplay();
  });

  function getLeaderboard() {
    const leaderboard = localStorage.getItem("typeDeckLeaderboard");
    return leaderboard ? JSON.parse(leaderboard) : [];
  }
  
  function saveToLeaderboard(name, score) {
    const leaderboard = getLeaderboard();
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 5) leaderboard.pop(); // keep top 5
    localStorage.setItem("typeDeckLeaderboard", JSON.stringify(leaderboard));
  }

  function showLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "<h2>🏆 Leaderboard</h2>";
  
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.marginTop = "10px";
    closeBtn.addEventListener("click", () => {
      leaderboard.style.display = "none";
    });
    leaderboard.appendChild(closeBtn);
  
    const savedScores = JSON.parse(localStorage.getItem("typeDeckLeaderboard")) || [];
  
    if (savedScores.length === 0) {
      leaderboard.innerHTML += "<p>No scores yet.</p>";
      return;
    }
  
    const sorted = savedScores.sort((a, b) => b.score - a.score).slice(0, 5);
  
    const ul = document.createElement("ul");
    sorted.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.name}: ${entry.score} words`;
      ul.appendChild(li);
    });
  
    leaderboard.appendChild(ul);
  }