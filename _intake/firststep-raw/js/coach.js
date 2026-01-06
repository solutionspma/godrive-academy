// ===================================
// DRIVING COACH APP - REBUILT
// ===================================

import { getCurrentUser, getUserProfile, savePracticeSession } from '../supabase/supabaseClient.js'
import { currentUser as authUser, userProfile, initAuth, checkDemoBanner } from './auth-core.js'
import { getQuestionsForState } from './openai-questions.js'
import { buildUSAMap } from './usa-map-builder.js'

const stateSelector = document.getElementById("stateSelector")
const quizArea = document.getElementById("quizArea")
const coachCharacter = document.getElementById("coachCharacter")
const coachMessage = document.getElementById("coachMessage")

let currentState = null
let currentData = null
let currentIndex = 0
let score = 0
let startTime = null
let currentUser = null
let currentProfile = null

// Coach messages
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
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for auth to initialize
  await initAuth()
  await checkDemoBanner()
  
  // Get current user state
  currentUser = await getCurrentUser()
  if (currentUser) {
    currentProfile = await getUserProfile(currentUser.id)
  }
  
  // Build real USA map with all 50 states
  buildUSAMap('usaMap', handleStateSelection)
  
  // Show coach character
  if (coachCharacter) {
    coachCharacter.classList.remove('hidden')
  }
  
  // Show welcome message
  updateCoachMessage('welcome')
})

// Handle state selection from map
async function handleStateSelection(stateCode, stateName) {
  updateCoachMessage('encouragement', `Great choice! Loading ${stateName} practice test...`)
  await loadQuiz(stateCode)
}

// Update coach message
function updateCoachMessage(type, customMessage = null) {
  if (!coachCharacter || !coachMessage) return
  
  if (customMessage) {
    coachMessage.querySelector('p').textContent = customMessage
  } else {
    const messages = coachMessages[type] || coachMessages.welcome
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    coachMessage.querySelector('p').textContent = randomMessage
  }
  
  // Update coach expression
  coachCharacter.classList.remove('correct', 'incorrect', 'thinking')
  if (type === 'correct') {
    coachCharacter.classList.add('correct')
  } else if (type === 'incorrect') {
    coachCharacter.classList.add('incorrect')
  }
}

// Load quiz data
async function loadQuiz(state) {
  try {
    // Refresh user data
    currentUser = await getCurrentUser()
    if (currentUser) {
      currentProfile = await getUserProfile(currentUser.id)
    }
    
    // Determine question count based on role
    let questionCount = 10 // Default for students/non-logged in
    
    // If admin/owner/staff, give 50 questions
    if (currentProfile && ['admin', 'owner', 'staff'].includes(currentProfile.role)) {
      questionCount = 50
    }
    
    // Try to fetch pre-generated JSON first
    let data = null
    try {
      const res = await fetch(`/data/${state}-questions.json`)
      if (res.ok) {
        data = await res.json()
        console.log(`✅ Loaded static questions for ${state}`)
      }
    } catch (fetchError) {
      console.log(`⚠️ No static data for ${state}, falling back to OpenAI...`)
    }
    
    // Fallback to OpenAI if no static file exists
    if (!data || !data.questions || data.questions.length === 0) {
      console.log(`🤖 Generating questions for ${state} using OpenAI...`)
      const generatedQuestions = await getQuestionsForState(state, questionCount)
      
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error(`Failed to generate questions for ${state}`)
      }
      
      data = {
        state: generatedQuestions.state || state,
        stateCode: state,
        questions: generatedQuestions.questions || generatedQuestions
      }
    }
    
    // Shuffle and select questions
    const shuffled = [...data.questions].sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, questionCount)
    
    currentState = state
    currentData = {
      ...data,
      questions: selectedQuestions
    }
    currentIndex = 0
    score = 0
    startTime = new Date()
    
    startQuiz()
  } catch (error) {
    console.error("Error loading quiz:", error)
    alert(`Sorry, we encountered an error loading the test for this state. Please try again or select a different state.`)
  }
}

// Start quiz
function startQuiz() {
  stateSelector.style.display = "none"
  quizArea.style.display = "block"
  updateCoachMessage('encouragement')
  showQuestion()
}

// Show current question
function showQuestion() {
  const question = currentData.questions[currentIndex]
  const questionNum = currentIndex + 1
  const totalQuestions = currentData.questions.length
  
  document.getElementById("questionNumber").textContent = 
    `Question ${questionNum} of ${totalQuestions}`
  
  document.getElementById("questionText").textContent = question.question
  
  const optionsHTML = question.options.map((option, i) => `
    <button class="option-btn" onclick="window.selectAnswer('${option}')">${option}</button>
  `).join('')
  
  document.getElementById("options").innerHTML = optionsHTML
  document.getElementById("explanation").style.display = "none"
  document.getElementById("nextBtn").style.display = "none"
  
  // Add thinking animation
  coachCharacter.classList.add('thinking')
}

// Handle answer selection
window.selectAnswer = function(selected) {
  const question = currentData.questions[currentIndex]
  const isCorrect = selected === question.correctAnswer
  
  if (isCorrect) {
    score++
    updateCoachMessage('correct')
  } else {
    updateCoachMessage('incorrect')
  }
  
  // Show explanation
  const explanationDiv = document.getElementById("explanation")
  explanationDiv.innerHTML = `
    <div class="${isCorrect ? 'correct' : 'incorrect'}-answer">
      <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
      <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
      <p>${question.explanation}</p>
    </div>
  `
  explanationDiv.style.display = "block"
  
  // Disable option buttons
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true
    if (btn.textContent === question.correctAnswer) {
      btn.classList.add('correct')
    } else if (btn.textContent === selected && !isCorrect) {
      btn.classList.add('incorrect')
    }
  })
  
  // Show next button
  document.getElementById("nextBtn").style.display = "block"
}

// Next question
window.nextQuestion = function() {
  currentIndex++
  
  if (currentIndex < currentData.questions.length) {
    showQuestion()
  } else {
    showResults()
  }
}

// Show results
async function showResults() {
  const endTime = new Date()
  const durationSeconds = Math.floor((endTime - startTime) / 1000)
  const percentage = Math.round((score / currentData.questions.length) * 100)
  
  // Save session if logged in
  if (currentUser) {
    try {
      await savePracticeSession({
        state: currentData.state,
        stateCode: currentData.stateCode,
        score: score,
        totalQuestions: currentData.questions.length,
        durationSeconds: durationSeconds
      })
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }
  
  updateCoachMessage('complete')
  
  document.getElementById("questionNumber").style.display = "none"
  document.getElementById("questionText").textContent = "Test Complete!"
  document.getElementById("options").innerHTML = ""
  document.getElementById("nextBtn").style.display = "none"
  
  const passed = percentage >= 70
  
  document.getElementById("explanation").innerHTML = `
    <div class="results ${passed ? 'passed' : 'failed'}">
      <h2>${passed ? '🎉 Congratulations!' : '📚 Keep Practicing!'}</h2>
      <div class="score-display">
        <div class="score-circle">
          <span class="score-number">${percentage}%</span>
        </div>
      </div>
      <p class="score-details">
        You got <strong>${score}</strong> out of <strong>${currentData.questions.length}</strong> questions correct
      </p>
      <p>Time: ${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, '0')}</p>
      ${passed ? 
        '<p>Great job! You\'re ready for the real test!</p>' : 
        '<p>Don\'t worry! Review your mistakes and try again.</p>'
      }
      <div class="results-actions">
        <button onclick="window.retakeSameState()" class="primary-btn">Retake ${currentData.state} Test</button>
        <button onclick="window.takeNewTest()" class="secondary-btn">Try Different State</button>
        ${currentUser ? '<a href="dashboard.html" class="secondary-btn">View Dashboard</a>' : ''}
      </div>
    </div>
  `
  document.getElementById("explanation").style.display = "block"
}

// Retake same state
window.retakeSameState = function() {
  currentIndex = 0
  score = 0
  startTime = new Date()
  showQuestion()
  document.getElementById("questionNumber").style.display = "block"
}

// Take new test
window.takeNewTest = function() {
  quizArea.style.display = "none"
  stateSelector.style.display = "block"
  currentState = null
  currentData = null
  updateCoachMessage('welcome')
}
