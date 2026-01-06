// ===================================
// DRIVING COACH APP
// ===================================

// Check authentication
import { supabase } from '../supabase/supabaseClient.js';

const form = document.getElementById("stateForm");
const stateSelector = document.getElementById("stateSelector");
const quizArea = document.getElementById("quizArea");
const coachCharacter = document.getElementById("coachCharacter");
const coachMessage = document.getElementById("coachMessage");

let currentState = null;
let currentData = null;
let currentIndex = 0;
let score = 0;
let startTime = null;
let currentUser = null;

// Check and display demo banner
async function checkDemoBanner() {
  const banner = document.getElementById('demoBanner');
  if (!banner) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Show banner for non-authenticated users
  if (!user) {
    banner.style.display = 'flex';
    return;
  }
  
  // Check role for authenticated users
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!error && profile?.role === 'student') {
      banner.style.display = 'flex';
    }
  } catch (err) {
    console.log('Could not check user role for banner:', err);
    // Default to showing banner if we can't check role
    banner.style.display = 'flex';
  }
}

// Check if user is logged in
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  
  // Update nav to show logout if logged in
  if (user) {
    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink) {
      loginLink.textContent = 'Logout';
      loginLink.href = '#';
      loginLink.onclick = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.href = 'index.html';
      };
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  checkDemoBanner();
});

// Coach messages for different scenarios
const coachMessages = {
  welcome: [
    "Hi! I'm Coach Taylor. Let's ace this test together! 🚗",
    "Ready to crush this test? I'll be here to help! 💪",
    "Let's get you road-ready! Pick your state to begin! 🎯"
  ],
  correct: [
    "That's right! You're doing great! 🌟",
    "Perfect answer! You really know your stuff! 🎉",
    "Excellent! Keep up the good work! ⭐",
    "Nailed it! You're on fire! 🔥",
    "That's how it's done! Outstanding! 👏"
  ],
  incorrect: [
    "Not quite, but that's okay! Learn from this one. 💡",
    "Close! Review the explanation and you'll get it next time. 📚",
    "Don't worry! Every mistake is a learning opportunity. 🎓",
    "That's alright! The explanation will help you remember. ✍️"
  ],
  encouragement: [
    "You've got this! Keep going! 💪",
    "Great progress! Stay focused! 🎯",
    "You're doing well! Keep it up! ⭐",
    "Nice work so far! Let's continue! 🚀"
  ],
  complete: [
    "Amazing job completing the test! 🎊",
    "You made it! Great effort! 🏆",
    "Test complete! Way to go! 🎉"
  ]
};

// Update coach message
function updateCoachMessage(type, customMessage = null) {
  if (!coachCharacter || !coachMessage) return;
  
  if (customMessage) {
    coachMessage.querySelector('p').textContent = customMessage;
  } else {
    const messages = coachMessages[type] || coachMessages.welcome;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    coachMessage.querySelector('p').textContent = randomMessage;
  }
  
  // Update coach expression
  coachCharacter.classList.remove('correct', 'incorrect', 'thinking');
  if (type === 'correct') {
    coachCharacter.classList.add('correct');
  } else if (type === 'incorrect') {
    coachCharacter.classList.add('incorrect');
  }
}

// Initialize
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const state = document.getElementById("state").value;
  
  if (!state) {
    alert("Please select a state");
    return;
  }
  
  await loadQuiz(state);
});

// Load quiz data
async function loadQuiz(state) {
  try {
    // Determine question count based on user role
    let questionCount = 10; // default for demo
    let fileName = `${state}.json`;
    
    if (currentUser) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        
        if (!error && profile && (profile.role === 'admin' || profile.role === 'owner' || profile.role === 'staff')) {
          questionCount = 50;
          // Use the 50-question file for CA, regular file for others
          if (state === 'CA') {
            fileName = 'CA_50q.json';
          }
        }
      } catch (profileError) {
        console.log('Could not load profile, using default question count');
      }
    }
    
    const res = await fetch(`data/tests/${fileName}`);
    
    if (!res.ok) {
      throw new Error(`State data not found for ${state}`);
    }
    
    const data = await res.json();
    
    // Shuffle and select random questions
    const shuffled = data.questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, questionCount);
    
    currentState = state;
    currentData = {
      ...data,
      questions: selectedQuestions
    };
    currentIndex = 0;
    score = 0;
    startTime = new Date();
    
    startQuiz();
  } catch (error) {
    console.error("Error loading quiz:", error);
    alert(`Sorry, we don't have test data for this state yet. Please try California or Texas.`);
  }
}

// Start quiz
function startQuiz() {
  stateSelector.classList.add("hidden");
  quizArea.classList.remove("hidden");
  
  // Show coach character
  if (coachCharacter) {
    coachCharacter.classList.remove("hidden");
    updateCoachMessage('encouragement');
  }
  
  showQuestion();
}

// Show current question
function showQuestion() {
  const q = currentData.questions[currentIndex];
  const totalQuestions = currentData.questions.length;
  
  // Update coach for new question
  if (currentIndex > 0 && currentIndex % 3 === 0) {
    updateCoachMessage('encouragement');
  }
  
  quizArea.innerHTML = `
    <div class="quiz-progress">
      Question ${currentIndex + 1} of ${totalQuestions}
    </div>
    <div class="quiz-card">
      <h2>${q.question}</h2>
      <div class="options">
        ${q.options.map((opt, i) => `
          <button class="opt-btn" data-index="${i}">${opt}</button>
        `).join("")}
      </div>
    </div>
  `;
  
  // Add event listeners to option buttons
  quizArea.querySelectorAll(".opt-btn").forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(parseInt(btn.dataset.index)));
  });
}

// Handle answer selection
function handleAnswer(selectedIndex) {
  const q = currentData.questions[currentIndex];
  const isCorrect = selectedIndex === q.answer;
  
  if (isCorrect) {
    score++;
    updateCoachMessage('correct');
  } else {
    updateCoachMessage('incorrect');
  }
  
  showExplanation(q, isCorrect, selectedIndex);
}

// Show explanation
function showExplanation(question, isCorrect, selectedIndex) {
  const correctClass = isCorrect ? 'correct' : 'incorrect';
  const statusIcon = isCorrect ? '✅' : '❌';
  const statusText = isCorrect ? 'Correct!' : 'Incorrect';
  
  quizArea.innerHTML = `
    <div class="explanation-card ${correctClass}">
      <h2 class="${correctClass}">${statusIcon} ${statusText}</h2>
      
      ${!isCorrect ? `
        <p><strong>You selected:</strong> ${question.options[selectedIndex]}</p>
        <p><strong>Correct answer:</strong> ${question.options[question.answer]}</p>
      ` : ''}
      
      <div class="explanation-text">
        <strong>Explanation:</strong><br>
        ${question.explanation}
      </div>
      
      <button class="btn-next" id="nextBtn">
        ${currentIndex + 1 < currentData.questions.length ? 'Next Question →' : 'See Results'}
      </button>
    </div>
  `;
  
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);
}

// Move to next question or show results
function nextQuestion() {
  currentIndex++;
  
  if (currentIndex < currentData.questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// Show final results
function showResults() {
  const totalQuestions = currentData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / 1000); // seconds
  
  let message = '';
  let emoji = '';
  
  if (percentage >= 80) {
    emoji = '🎉';
    message = 'Excellent! You\'re ready for the real test!';
    updateCoachMessage('complete', 'Outstanding performance! You\'re definitely ready! 🏆');
  } else if (percentage >= 60) {
    emoji = '👍';
    message = 'Good job! Keep practicing to improve.';
    updateCoachMessage('complete', 'Good effort! A bit more practice and you\'ll ace it! 💪');
  } else {
    emoji = '📚';
    message = 'Keep studying! Review the explanations and try again.';
    updateCoachMessage('complete', 'Keep going! Review and try again - you\'ll get better! 📚');
  }
  
  quizArea.innerHTML = `
    <div class="results-card">
      <h2>${emoji} Quiz Complete!</h2>
      <div class="score-display">${score} / ${totalQuestions}</div>
      <div class="score-message">
        <strong>${percentage}%</strong><br>
        ${message}
      </div>
      <p style="color: #64748b; margin-bottom: 2rem;">
        Completed in ${Math.floor(duration / 60)}m ${duration % 60}s
      </p>
      <button class="btn-retry" onclick="location.reload()">
        Try Another State
      </button>
      <button class="btn-retry" onclick="retakeSameState()">
        Retake ${currentData.state} Test
      </button>
    </div>
  `;
  
  // Optional: Send results to Supabase for tracking
  saveResults(percentage, duration);
}

// Retake same state test
window.retakeSameState = function() {
  currentIndex = 0;
  score = 0;
  startTime = new Date();
  showQuestion();
}

// Save results to Supabase (optional)
async function saveResults(percentage, duration) {
  // Check if Supabase client exists
  if (typeof supabase === 'undefined') {
    console.log('Supabase not configured - skipping results save');
    return;
  }
  
  try {
    const sessionData = {
      state_code: currentState,
      total_questions: currentData.questions.length,
      correct_answers: score,
      score_percentage: percentage,
      duration_seconds: duration,
      completed_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert([sessionData]);
    
    if (error) {
      console.error('Error saving session:', error);
    } else {
      console.log('Session saved successfully');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
