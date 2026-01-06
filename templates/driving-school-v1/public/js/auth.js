// ===================================
// AUTH HELPER FUNCTIONS
// ===================================

// Check if user is authenticated
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get user profile with role
async function getUserProfile() {
  const user = await checkAuth();
  
  if (!user) return null;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return { ...user, ...profile };
}

// Check if user has required role
async function checkRole(requiredRoles = []) {
  const profile = await getUserProfile();
  
  if (!profile) return false;
  
  return requiredRoles.includes(profile.role);
}

// Protect page - redirect if not authenticated
async function protectPage(requiredRoles = null) {
  const user = await checkAuth();
  
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  
  if (requiredRoles) {
    const hasRole = await checkRole(requiredRoles);
    if (!hasRole) {
      alert('Access denied. You do not have permission to view this page.');
      window.location.href = 'coach.html';
      return false;
    }
  }
  
  return true;
}

// Logout function
async function logout() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error logging out:', error);
    alert('Error logging out. Please try again.');
  } else {
    window.location.href = 'index.html';
  }
}

// Display user info in UI
async function displayUserInfo(elementId = 'userInfo') {
  const profile = await getUserProfile();
  const element = document.getElementById(elementId);
  
  if (!element) return;
  
  if (profile) {
    element.innerHTML = `
      <div class="user-info">
        <span class="user-name">${profile.full_name || profile.email}</span>
        <span class="user-role">${profile.role}</span>
        <button onclick="logout()" class="btn-logout">Logout</button>
      </div>
    `;
  }
}

// Initialize auth state listener
function initAuthListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in:', session.user);
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    }
  });
}

// Call this on page load
if (typeof supabase !== 'undefined') {
  initAuthListener();
}
