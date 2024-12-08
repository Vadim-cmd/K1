document.addEventListener('DOMContentLoaded', () => {
  const socket = io('http://localhost:3000');

  const questions = [
      { text: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
      { text: "What is 3 + 5?", options: ["7", "8", "9", "10"], answer: "8" },
      { text: "What is 10 - 7?", options: ["1", "2", "3", "4"], answer: "3" },
  ];

  const gamePinElement = document.getElementById('game-pin');
  const usernameInput = document.getElementById('username');
  const pinInput = document.getElementById('pin');
  const joinGameButton = document.getElementById('join-game-button');
  const loginContainer = document.getElementById('login-container');
  const gameContainer = document.getElementById('game-container');
  const leaderboardList = document.getElementById('leaderboard-list');
  const questionText = document.querySelector('.question-text');
  const optionsContainer = document.querySelector('.options-container');
  const questionNumber = document.getElementById('question-number');
  const nextButton = document.getElementById('next-button');

  let currentPlayer = null;
  let currentPin = null;
  let currentQuestion = 0;

  const generatePin = () => Math.floor(1000 + Math.random() * 9000);
  const gamePin = generatePin();
  gamePinElement.textContent = gamePin;

  function updateLeaderboard(players) {
      leaderboardList.innerHTML = '';
      Object.entries(players)
          .sort(([, aScore], [, bScore]) => bScore - aScore)
          .forEach(([name, score]) => {
              const li = document.createElement('li');
              li.textContent = `${name}: ${score} points`;
              leaderboardList.appendChild(li);
          });
  }

  joinGameButton.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      const pin = pinInput.value.trim();
      if (!username || !pin) {
          alert('Please enter a valid username and PIN.');
          return;
      }
      currentPlayer = username;
      currentPin = pin;
      socket.emit('joinGame', { username, pin });
      loginContainer.style.display = 'none';
      gameContainer.style.display = 'block';
      loadQuestion();
  });

  function loadQuestion() {
      const question = questions[currentQuestion];
      questionText.textContent = question.text;
      questionNumber.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
      optionsContainer.innerHTML = '';
      nextButton.disabled = true;

      question.options.forEach(optionText => {
          const button = document.createElement('button');
          button.classList.add('option');
          button.textContent = optionText;
          button.addEventListener('click', () => handleOptionClick(button, optionText));
          optionsContainer.appendChild(button);
      });
  }

  function handleOptionClick(button, optionText) {
      const question = questions[currentQuestion];
      const correct = optionText === question.answer;

      document.querySelectorAll('.option').forEach(btn => btn.disabled = true);
      button.style.backgroundColor = correct ? 'green' : 'red';
      nextButton.disabled = false;

      socket.emit('submitAnswer', { pin: currentPin, username: currentPlayer, correct });
  }

  socket.on('updateLeaderboard', players => {
      updateLeaderboard(players);
  });

  nextButton.addEventListener('click', () => {
      currentQuestion++;
      if (currentQuestion < questions.length) {
          loadQuestion();
      } else {
          alert('Quiz Completed!');
          currentQuestion = 0;
          loadQuestion();
      }
  });
});