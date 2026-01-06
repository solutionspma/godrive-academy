// ===================================
// DASHBOARD - ANALYTICS & STATS
// ===================================

// Protect dashboard - all authenticated users can access
(async function() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  const profile = await getUserProfile();
  displayUserInfo(profile);
  
  // Show admin link for admin/owner/staff
  if (profile && ['admin', 'owner', 'staff'].includes(profile.role)) {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
      adminLink.style.display = 'block';
    }
    // Load admin stats
    loadDashboardData();
  } else {
    // Load student stats
    loadStudentDashboard();
  }
})();

// Load all dashboard data
async function loadDashboardData() {
  await Promise.all([
    loadStats(),
    loadRecentSessions(),
    loadStateStats(),
    loadLeaderboard()
  ]);
}

// Load overview stats
async function loadStats() {
  try {
    // Total students
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    
    document.getElementById('totalUsers').textContent = userCount || 0;
    
    // Total sessions
    const { count: sessionCount } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true });
    
    document.getElementById('totalSessions').textContent = sessionCount || 0;
    
    // Total questions
    const { count: questionCount } = await supabase
      .from('driving_test_questions')
      .select('*', { count: 'exact', head: true });
    
    document.getElementById('totalQuestions').textContent = questionCount || 0;
    
    // Average score
    const { data: sessions } = await supabase
      .from('practice_sessions')
      .select('score_percentage');
    
    if (sessions && sessions.length > 0) {
      const avgScore = Math.round(
        sessions.reduce((sum, s) => sum + s.score_percentage, 0) / sessions.length
      );
      document.getElementById('avgScore').textContent = `${avgScore}%`;
    } else {
      document.getElementById('avgScore').textContent = 'N/A';
    }
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load recent practice sessions
async function loadRecentSessions() {
  const sessionList = document.getElementById('recentSessions');
  
  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order('completed_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      sessionList.innerHTML = '<p class="loading">No sessions yet</p>';
      return;
    }
    
    sessionList.innerHTML = data.map(session => {
      const scoreClass = 
        session.score_percentage >= 80 ? 'high' :
        session.score_percentage >= 60 ? 'medium' : 'low';
      
      const userName = session.profiles?.full_name || session.profiles?.email || 'Guest';
      const date = new Date(session.completed_at).toLocaleDateString();
      const time = new Date(session.completed_at).toLocaleTimeString();
      
      return `
        <div class="session-item">
          <div class="session-header">
            <span class="state-badge">${session.state_code}</span>
            <span class="score ${scoreClass}">${session.score_percentage}%</span>
          </div>
          <div class="meta">
            <strong>${userName}</strong> • 
            ${session.correct_answers}/${session.total_questions} correct • 
            ${date} at ${time}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading sessions:', error);
    sessionList.innerHTML = '<p class="loading">Error loading sessions</p>';
  }
}

// Load state performance stats
async function loadStateStats() {
  const stateStats = document.getElementById('stateStats');
  
  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('state_code, score_percentage, id');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      stateStats.innerHTML = '<p class="loading">No state data yet</p>';
      return;
    }
    
    // Aggregate by state
    const stateMap = {};
    data.forEach(session => {
      if (!stateMap[session.state_code]) {
        stateMap[session.state_code] = {
          count: 0,
          totalScore: 0
        };
      }
      stateMap[session.state_code].count++;
      stateMap[session.state_code].totalScore += session.score_percentage;
    });
    
    // Convert to array and sort by count
    const stateArray = Object.entries(stateMap)
      .map(([code, stats]) => ({
        code,
        count: stats.count,
        avgScore: Math.round(stats.totalScore / stats.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    stateStats.innerHTML = stateArray.map(state => `
      <div class="state-item">
        <div class="state-name">${state.code}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${state.avgScore}%"></div>
        </div>
        <div class="stats-row">
          <span>${state.count} sessions</span>
          <span>${state.avgScore}% avg score</span>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading state stats:', error);
    stateStats.innerHTML = '<p class="loading">Error loading state stats</p>';
  }
}

// Load leaderboard
async function loadLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  
  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select(`
        user_id,
        score_percentage,
        state_code,
        profiles(full_name, email)
      `)
      .order('score_percentage', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      leaderboard.innerHTML = '<p class="loading">No data yet</p>';
      return;
    }
    
    // Aggregate by user
    const userMap = {};
    data.forEach(session => {
      const userId = session.user_id || 'guest';
      if (!userMap[userId]) {
        userMap[userId] = {
          name: session.profiles?.full_name || session.profiles?.email || 'Guest',
          totalTests: 0,
          totalScore: 0,
          bestScore: 0
        };
      }
      userMap[userId].totalTests++;
      userMap[userId].totalScore += session.score_percentage;
      userMap[userId].bestScore = Math.max(userMap[userId].bestScore, session.score_percentage);
    });
    
    // Convert to array and sort
    const leaderboardData = Object.entries(userMap)
      .map(([id, stats]) => ({
        name: stats.name,
        totalTests: stats.totalTests,
        avgScore: Math.round(stats.totalScore / stats.totalTests),
        bestScore: stats.bestScore
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);
    
    leaderboard.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Tests Taken</th>
            <th>Avg Score</th>
            <th>Best Score</th>
          </tr>
        </thead>
        <tbody>
          ${leaderboardData.map((user, index) => `
            <tr>
              <td class="rank rank-${index + 1}">#${index + 1}</td>
              <td>${user.name}</td>
              <td>${user.totalTests}</td>
              <td>${user.avgScore}%</td>
              <td><strong>${user.bestScore}%</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboard.innerHTML = '<p class="loading">Error loading leaderboard</p>';
  }
}

// Load student dashboard (personal stats only)
async function loadStudentDashboard() {
  try {
    const user = await checkAuth();
    
    // Get user's sessions
    const { data: sessions, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    
    // Update stats
    document.getElementById('totalSessions').textContent = sessions.length;
    
    if (sessions.length > 0) {
      const avgScore = Math.round(
        sessions.reduce((sum, s) => sum + (s.score / s.total_questions * 100), 0) / sessions.length
      );
      document.getElementById('avgScore').textContent = avgScore + '%';
      
      const bestScore = Math.max(...sessions.map(s => Math.round(s.score / s.total_questions * 100)));
      document.getElementById('totalQuestions').textContent = bestScore + '%';
    }
    
    // Show recent sessions
    const recentTable = document.getElementById('recentSessions');
    if (recentTable && sessions.length > 0) {
      recentTable.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>State</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.slice(0, 5).map(s => `
              <tr>
                <td>${new Date(s.completed_at).toLocaleDateString()}</td>
                <td>${s.state}</td>
                <td>${Math.round(s.score / s.total_questions * 100)}%</td>
                <td>${Math.floor(s.duration_seconds / 60)}:${(s.duration_seconds % 60).toString().padStart(2, '0')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  } catch (error) {
    console.error('Error loading student dashboard:', error);
  }
}
