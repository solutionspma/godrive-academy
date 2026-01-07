import { supabase, getCurrentUser, getUserProfile, signInUser, signOutUser } from '../supabase/supabaseClient.js'

// Global state
let currentUser = null
let userProfile = null

// Initialize authentication
async function initAuth() {
  currentUser = await getCurrentUser()
  
  if (currentUser) {
    userProfile = await getUserProfile(currentUser.id)
    updateNavigation()
    return true
  }
  
  return false
}

// Update navigation based on auth state
function updateNavigation() {
  const loginLink = document.querySelector('a[href="login.html"]')
  
  if (currentUser && loginLink) {
    loginLink.textContent = 'Logout'
    loginLink.href = '#'
    loginLink.onclick = async (e) => {
      e.preventDefault()
      await signOutUser()
      window.location.href = 'index.html'
    }
  }
}

// Check if demo banner should show
async function checkDemoBanner() {
  const banner = document.getElementById('demoBanner')
  if (!banner) return
  
  // Show banner if not logged in
  if (!currentUser) {
    banner.style.display = 'flex'
    return
  }
  
  // Show banner if user is student role
  if (userProfile && userProfile.role === 'student') {
    banner.style.display = 'flex'
  } else {
    banner.style.display = 'none'
  }
}

// Protect page (redirect if not authenticated)
async function protectPage() {
  const isAuthenticated = await initAuth()
  if (!isAuthenticated) {
    window.location.href = 'login.html'
  }
}

// Run on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  await initAuth()
  await checkDemoBanner()
})

// Export for use in other modules
export { currentUser, userProfile, initAuth, protectPage, checkDemoBanner }
