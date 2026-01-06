import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://drrrexovkxbhevwsueck.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycnJleG92a3hiaGV2d3N1ZWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODQwMTAsImV4cCI6MjA4Mjk2MDAxMH0.kaYOnK-lulidzJA0OVbvQ8pC82AQgsifjqDipIQ-Wlw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Get current authenticated user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// Get user profile with role
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error getting profile:', error)
    return null
  }
  return data
}

// Check if user has admin privileges
export async function isAdmin(userId) {
  const profile = await getUserProfile(userId)
  return profile && ['admin', 'owner', 'staff'].includes(profile.role)
}

// Sign up new user
export async function signUpUser(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  
  if (error) {
    console.error('Signup error:', error)
    throw error
  }
  
  return data
}

// Sign in user
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('Login error:', error)
    throw error
  }
  
  return data
}

// Sign out user
export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout error:', error)
    throw error
  }
}

// Save practice session
export async function savePracticeSession(sessionData) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Must be logged in to save session')
  }
  
  const { data, error } = await supabase
    .from('practice_sessions')
    .insert([{
      user_id: user.id,
      state: sessionData.state,
      state_code: sessionData.stateCode,
      score: sessionData.score,
      total_questions: sessionData.totalQuestions,
      duration_seconds: sessionData.durationSeconds
    }])
    .select()
  
  if (error) {
    console.error('Error saving session:', error)
    throw error
  }
  
  return data[0]
}

// Get user's practice sessions
export async function getUserSessions(userId, limit = 10) {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error getting sessions:', error)
    return []
  }
  
  return data
}
