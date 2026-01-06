// ===================================
// ADMIN PANEL - QUESTION MANAGER
// ===================================

// Protect admin page - only admin/owner/staff can access
(async function() {
  const hasAccess = await protectPage(['admin', 'owner', 'staff']);
  if (hasAccess) {
    displayUserInfo();
    loadRecentQuestions();
  }
})();

// Handle question form submission
document.getElementById('questionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('successMessage');
  const errorMsg = document.getElementById('errorMessage');
  
  // Get form values
  const stateCode = document.getElementById('stateCode').value;
  const category = document.getElementById('category').value || null;
  const difficulty = document.getElementById('difficulty').value || null;
  const question = document.getElementById('question').value.trim();
  const optionsText = document.getElementById('options').value.trim();
  const answerIndex = parseInt(document.getElementById('answerIndex').value);
  const explanation = document.getElementById('explanation').value.trim();
  
  // Parse options (one per line)
  const options = optionsText.split('\n').map(opt => opt.trim()).filter(opt => opt.length > 0);
  
  // Validation
  if (options.length < 2) {
    errorMsg.textContent = 'Please provide at least 2 answer options';
    errorMsg.classList.remove('hidden');
    successMsg.classList.add('hidden');
    return;
  }
  
  if (answerIndex < 0 || answerIndex >= options.length) {
    errorMsg.textContent = `Answer index must be between 0 and ${options.length - 1}`;
    errorMsg.classList.remove('hidden');
    successMsg.classList.add('hidden');
    return;
  }
  
  // Disable submit
  submitBtn.disabled = true;
  submitBtn.textContent = '💾 Saving...';
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert question
    const { data, error } = await supabase
      .from('driving_test_questions')
      .insert([{
        state_code: stateCode,
        question: question,
        options: JSON.stringify(options),
        answer_index: answerIndex,
        explanation: explanation,
        category: category,
        difficulty: difficulty,
        created_by: user.id
      }])
      .select();
    
    if (error) throw error;
    
    // Success
    successMsg.textContent = '✅ Question saved successfully!';
    successMsg.classList.remove('hidden');
    
    // Reset form
    document.getElementById('questionForm').reset();
    
    // Reload question list
    loadRecentQuestions();
    
  } catch (error) {
    console.error('Error saving question:', error);
    errorMsg.textContent = `Error: ${error.message}`;
    errorMsg.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '💾 Save Question';
  }
});

// Load recent questions
async function loadRecentQuestions() {
  const questionList = document.getElementById('questionList');
  
  try {
    const { data, error } = await supabase
      .from('driving_test_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    if (data.length === 0) {
      questionList.innerHTML = '<p class="loading">No questions yet. Add your first one!</p>';
      return;
    }
    
    questionList.innerHTML = data.map(q => {
      const options = JSON.parse(q.options);
      return `
        <div class="question-item">
          <div>
            <span class="state-badge">${q.state_code}</span>
            ${q.category ? `<span class="category-badge">${q.category}</span>` : ''}
            ${q.difficulty ? `<span class="category-badge">${q.difficulty}</span>` : ''}
          </div>
          <p class="question-text">${q.question}</p>
          <div class="options-list">
            ${options.map((opt, i) => `
              <div ${i === q.answer_index ? 'class="correct-answer"' : ''}>
                ${i === q.answer_index ? '✓' : '•'} ${opt}
              </div>
            `).join('')}
          </div>
          <p class="meta">
            Added ${new Date(q.created_at).toLocaleDateString()} | 
            Version: ${q.version}
          </p>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading questions:', error);
    questionList.innerHTML = '<p class="loading">Error loading questions</p>';
  }
}

// Auto-update answer index max based on options count
document.getElementById('options').addEventListener('input', (e) => {
  const optionsText = e.target.value.trim();
  const options = optionsText.split('\n').filter(opt => opt.trim().length > 0);
  const answerInput = document.getElementById('answerIndex');
  
  if (options.length > 0) {
    answerInput.max = options.length - 1;
    answerInput.placeholder = `0 to ${options.length - 1}`;
  }
});
