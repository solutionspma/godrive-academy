// OpenAI Integration for DMV Questions
const OPENAI_API_KEY = ''; // Add your OpenAI API key here

export async function generateDMVQuestions(state, count = 10) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a DMV test question generator. Generate realistic, accurate DMV driving test questions for ${state}. Each question should have 4 multiple choice options with one correct answer and a brief explanation.`
          },
          {
            role: 'user',
            content: `Generate ${count} DMV practice test questions for ${state}. Format as JSON array with this structure:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option text",
    "explanation": "Why this is correct"
  }
]

Cover topics like:
- Traffic laws and regulations
- Road signs and signals
- Safe driving practices
- Right-of-way rules
- Speed limits and parking
- Driving conditions (weather, night driving)
- Vehicle safety and maintenance

Make questions realistic, challenging but fair, and based on actual DMV content.`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from OpenAI response')
    }
    
    const questions = JSON.parse(jsonMatch[0])
    
    return {
      state: state,
      stateCode: state,
      version: '1.0-ai',
      generatedAt: new Date().toISOString(),
      questions: questions
    }
    
  } catch (error) {
    console.error('Error generating questions with OpenAI:', error)
    throw error
  }
}

// Cache questions to avoid repeated API calls
const questionCache = new Map()

export async function getQuestionsForState(state, count = 10, useCache = true) {
  const cacheKey = `${state}-${count}`
  
  if (useCache && questionCache.has(cacheKey)) {
    console.log('Using cached questions for', state)
    return questionCache.get(cacheKey)
  }
  
  console.log('Generating new questions for', state)
  const questions = await generateDMVQuestions(state, count)
  questionCache.set(cacheKey, questions)
  
  return questions
}
