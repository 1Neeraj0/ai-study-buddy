const Groq = require('groq-sdk');

let client = null;

const getClient = () => {
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
};

const callAI = async (systemPrompt, userMessage) => {
  const groq = getClient();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  return response.choices[0].message.content;
};

exports.summarize = async (content) => {
  const systemPrompt = `You are an expert study assistant. Summarize the following notes concisely, 
highlighting the key concepts, important facts, and main takeaways. 
Use bullet points for clarity. Keep it under 300 words.`;
  return callAI(systemPrompt, content);
};

exports.generateFlashcards = async (content) => {
  const systemPrompt = `You are an expert study assistant. Generate flashcards from the given notes.
Return ONLY valid JSON array with objects containing "question" and "answer" fields.
Generate 5-10 flashcards covering the key concepts.
Do not include any markdown formatting or code blocks, just the raw JSON array.
Example format: [{"question": "What is X?", "answer": "X is..."}]`;
  const result = await callAI(systemPrompt, content);
  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
};

exports.askQuestion = async (content, question) => {
  const systemPrompt = `You are an expert study assistant. The user has notes and wants to ask a question about them.
Answer based ONLY on the provided notes. If the answer is not in the notes, say so.
Be clear and educational in your response.

Notes:
${content}`;
  return callAI(systemPrompt, question);
};

exports.generateQuiz = async (content) => {
  const systemPrompt = `You are an expert study assistant. Generate a multiple-choice quiz from the given notes.
Return ONLY valid JSON array with objects containing:
- "question": the quiz question
- "options": array of 4 option strings
- "correctIndex": index (0-3) of the correct option
- "explanation": brief explanation of the correct answer
Generate 5 questions.
Do not include any markdown formatting or code blocks, just the raw JSON array.
Example: [{"question":"What is X?","options":["A","B","C","D"],"correctIndex":0,"explanation":"A is correct because..."}]`;
  const result = await callAI(systemPrompt, content);
  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
};
