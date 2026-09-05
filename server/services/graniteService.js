/**
 * graniteService.js
 * IBM Granite / watsonx.ai AI Service Layer
 * All AI functionality is routed through this service.
 */

import axios from 'axios';

// ─── IBM watsonx.ai token cache ────────────────────────────────────────────
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Obtain an IAM Bearer token from IBM Cloud using the API key.
 * Tokens are cached and reused until they are about to expire.
 */
const getIBMAccessToken = async () => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60_000) {
    return cachedToken;
  }

  const apiKey = process.env.IBM_API_KEY;
  if (!apiKey) {
    throw new Error('IBM_API_KEY is not configured. Please add it to your .env file.');
  }

  try {
    const response = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      }
    );

    cachedToken = response.data.access_token;
    // expires_in is in seconds
    tokenExpiry = now + response.data.expires_in * 1000;
    return cachedToken;
  } catch (err) {
    const detail = err.response?.data?.errorMessage || err.response?.data?.errorDescription || err.message;
    throw new Error(`IBM IAM token error: ${detail}`);
  }
};

/**
 * Core function: send a prompt to IBM Granite via watsonx.ai and return the text.
 */
const callGranite = async (prompt, maxTokens = 1500) => {
  const projectId = process.env.IBM_PROJECT_ID;
  const modelId = process.env.IBM_GRANITE_MODEL_ID || 'ibm/granite-3-8b-instruct';
  const baseUrl = process.env.IBM_GRANITE_URL || 'https://us-south.ml.cloud.ibm.com';

  if (!projectId) {
    throw new Error('IBM_PROJECT_ID is not configured. Please add it to your .env file.');
  }

  const token = await getIBMAccessToken();

  const endpoint = `${baseUrl}/ml/v1/text/generation?version=2023-05-29`;

  const payload = {
    model_id: modelId,
    input: prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: maxTokens,
      min_new_tokens: 10,
      stop_sequences: [],
      repetition_penalty: 1.1,
    },
    project_id: projectId,
  };

  let response;
  try {
    response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 60000,
    });
  } catch (err) {
    // Surface the IBM error body if available
    const ibmError = err.response?.data?.errors?.[0]?.message
      || err.response?.data?.error
      || err.response?.data?.message
      || err.message;
    const status = err.response?.status ? ` (HTTP ${err.response.status})` : '';
    throw new Error(`IBM Granite API error${status}: ${ibmError}`);
  }

  const result = response.data?.results?.[0]?.generated_text;
  if (!result) {
    throw new Error('IBM Granite returned an empty response.');
  }
  return result.trim();
};

/**
 * Safely parse JSON from AI response.
 * Tries to extract the first JSON object/array from the text.
 */
const parseJSON = (text) => {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (_) {}

  // Extract JSON block from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {}
  }

  // Extract first {...} or [...] block
  const objMatch = text.match(/(\{[\s\S]*\})/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[1]);
    } catch (_) {}
  }
  const arrMatch = text.match(/(\[[\s\S]*\])/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[1]);
    } catch (_) {}
  }

  throw new Error('Could not parse JSON from AI response: ' + text.substring(0, 200));
};

// ─── Public AI Functions ────────────────────────────────────────────────────

/**
 * Generate a personalized learning roadmap for a student.
 */
export const generateLearningRoadmap = async (userProfile) => {
  const {
    name,
    learningGoal,
    interests,
    currentSkills,
    skillLevel,
    careerGoal,
    studyHoursPerWeek,
    roadmapDuration,
    learningStyle,
  } = userProfile;

  const durationWeeksMap = {
    '1-month': 4,
    '3-months': 12,
    '6-months': 24,
    '1-year': 48,
  };
  const totalWeeks = durationWeeksMap[roadmapDuration] || 12;

  const prompt = `You are an expert learning coach AI. Generate a detailed personalized learning roadmap in valid JSON format only.

Student Profile:
- Name: ${name}
- Learning Goal: ${learningGoal}
- Interests: ${(interests || []).join(', ')}
- Current Skills: ${(currentSkills || []).join(', ') || 'None'}
- Skill Level: ${skillLevel}
- Career Goal: ${careerGoal}
- Study Hours Per Week: ${studyHoursPerWeek}
- Duration: ${roadmapDuration} (${totalWeeks} weeks)
- Learning Style: ${learningStyle}

Generate a roadmap with exactly ${Math.min(totalWeeks, 12)} weeks. Each week should build on the previous.

Respond with ONLY valid JSON in this exact format:
{
  "title": "Personalized [topic] Roadmap",
  "goal": "Become [goal]-ready",
  "duration": "${roadmapDuration}",
  "overview": "Brief 2-sentence overview",
  "weeks": [
    {
      "week": 1,
      "title": "Week title",
      "description": "What this week covers",
      "topics": [
        {"title": "Topic name", "description": "Brief description", "completed": false}
      ],
      "tasks": [
        {"title": "Task description", "type": "practice", "completed": false}
      ],
      "estimatedHours": 8
    }
  ]
}

Return ONLY the JSON object, no other text.`;

  const raw = await callGranite(prompt, 3000);
  const roadmap = parseJSON(raw);

  // Validate structure
  if (!roadmap.title || !roadmap.weeks || !Array.isArray(roadmap.weeks)) {
    throw new Error('Invalid roadmap structure returned by AI');
  }

  return roadmap;
};

/**
 * Generate course/resource recommendations based on user profile and progress.
 */
export const generateCourseRecommendations = async (userProfile, progressData) => {
  const { learningGoal, interests, skillLevel, careerGoal, currentSkills } = userProfile;
  const weakAreas = progressData?.weakAreas || [];
  const completedTopics = progressData?.completedTopics || [];

  const prompt = `You are an expert learning coach AI. Recommend learning resources for a student.

Student Profile:
- Learning Goal: ${learningGoal}
- Interests: ${(interests || []).join(', ')}
- Skill Level: ${skillLevel}
- Career Goal: ${careerGoal}
- Current Skills: ${(currentSkills || []).join(', ') || 'None'}
- Completed Topics: ${completedTopics.slice(-5).join(', ') || 'None yet'}
- Weak Areas: ${weakAreas.join(', ') || 'None identified'}

Generate exactly 6 learning resource recommendations.

Respond with ONLY valid JSON array:
[
  {
    "title": "Resource title",
    "topic": "Main topic",
    "difficulty": "beginner|intermediate|advanced",
    "reason": "Why this is recommended for this student",
    "estimatedTime": "e.g. 4 hours",
    "resourceUrl": "",
    "resourceType": "course|article|video|practice"
  }
]

Return ONLY the JSON array, no other text.`;

  const raw = await callGranite(prompt, 1500);
  const recommendations = parseJSON(raw);

  if (!Array.isArray(recommendations)) {
    throw new Error('Invalid recommendations format from AI');
  }

  return recommendations;
};

/**
 * Generate skill assessment questions for a domain.
 */
export const generateSkillAssessment = async (domain, skillLevel) => {
  const prompt = `You are an expert technical instructor. Generate a skill assessment for "${domain}" at "${skillLevel}" level.

Create exactly 5 questions: 4 multiple choice and 1 short answer.

Respond with ONLY valid JSON array:
[
  {
    "question": "Question text",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this is correct"
  },
  {
    "question": "Short answer question",
    "type": "short",
    "options": [],
    "correctAnswer": "Key concepts expected in the answer",
    "explanation": "What a good answer should include"
  }
]

Return ONLY the JSON array, no other text.`;

  const raw = await callGranite(prompt, 1500);
  const questions = parseJSON(raw);

  if (!Array.isArray(questions)) {
    throw new Error('Invalid questions format from AI');
  }

  return questions;
};

/**
 * Evaluate submitted assessment answers.
 */
export const evaluateAssessment = async (domain, questions, answers) => {
  const qa = questions.map((q, i) => ({
    question: q.question,
    correctAnswer: q.correctAnswer,
    userAnswer: answers[i] || '',
    type: q.type,
  }));

  const prompt = `You are an expert technical evaluator. Evaluate this ${domain} assessment.

Questions and Answers:
${JSON.stringify(qa, null, 2)}

Analyze the performance and respond with ONLY valid JSON:
{
  "score": <number of correct answers>,
  "percentage": <percentage 0-100>,
  "skillLevel": "beginner|intermediate|advanced",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": "2-3 sentence personalized recommendation for improvement",
  "evaluations": [
    {
      "questionIndex": 0,
      "isCorrect": true,
      "feedback": "Brief feedback"
    }
  ]
}

Return ONLY the JSON object, no other text.`;

  const raw = await callGranite(prompt, 1000);
  return parseJSON(raw);
};

/**
 * Generate a chat response from the AI learning coach.
 */
export const generateAIChatResponse = async (userMessage, userProfile, conversationHistory, progressData) => {
  const recentHistory = (conversationHistory || []).slice(-6);
  const historyText = recentHistory
    .map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`)
    .join('\n');

  const prompt = `You are LearnMate, a personalized AI learning coach. Be helpful, encouraging, and specific.

Student Context:
- Name: ${userProfile.name}
- Goal: ${userProfile.learningGoal}
- Skill Level: ${userProfile.skillLevel}
- Interests: ${(userProfile.interests || []).join(', ')}
- Career Goal: ${userProfile.careerGoal}
- Current Progress: ${progressData?.completedTopics?.length || 0} topics completed
- Current Streak: ${progressData?.currentStreak || 0} days

Recent Conversation:
${historyText || 'No previous messages.'}

Student: ${userMessage}

Respond as LearnMate coach. Be concise (under 200 words), personalized, actionable, and encouraging. Address the student by name occasionally.

Coach:`;

  const response = await callGranite(prompt, 500);
  return response;
};

/**
 * Analyze learning progress and suggest adaptations.
 */
export const analyzeLearningProgress = async (userProfile, roadmap, progressData) => {
  const completedTopics = progressData?.completedTopics || [];
  const totalTopics = progressData?.totalTopics || 1;
  const completionRate = Math.round((completedTopics.length / totalTopics) * 100);

  const prompt = `You are an adaptive AI learning coach. Analyze this student's learning progress.

Student: ${userProfile.name}
Goal: ${userProfile.learningGoal}
Skill Level: ${userProfile.skillLevel}
Study Hours/Week: ${userProfile.studyHoursPerWeek}

Roadmap: ${roadmap.title}
Duration: ${roadmap.duration}
Overall Progress: ${completionRate}% (${completedTopics.length}/${totalTopics} topics)
Recent Completed Topics: ${completedTopics.slice(-5).join(', ') || 'None'}
Current Streak: ${progressData?.currentStreak || 0} days

Respond with ONLY valid JSON:
{
  "progressSummary": "2-sentence summary of student's progress",
  "nextRecommendedTopic": "Specific topic to study next",
  "insights": ["insight1", "insight2", "insight3"],
  "weakAreas": ["area1", "area2"],
  "adaptationSuggestion": "What should change in the learning plan",
  "motivationalMessage": "Encouraging message for the student"
}

Return ONLY the JSON object, no other text.`;

  const raw = await callGranite(prompt, 800);
  return parseJSON(raw);
};

/**
 * Adapt the learning roadmap based on current progress and feedback.
 */
export const adaptLearningRoadmap = async (userProfile, currentRoadmap, progressData, userFeedback) => {
  const completedTopics = progressData?.completedTopics || [];
  const weakAreas = progressData?.weakAreas || [];
  const assessmentResults = progressData?.latestAssessment || null;

  const prompt = `You are an adaptive AI learning coach. Update and adapt a student's learning roadmap.

Student: ${userProfile.name}
Current Skill Level: ${userProfile.skillLevel}
Study Hours/Week: ${userProfile.studyHoursPerWeek}

Current Roadmap: ${currentRoadmap.title}
Completed Topics: ${completedTopics.join(', ') || 'None'}
Weak Areas: ${weakAreas.join(', ') || 'None identified'}
Assessment Results: ${assessmentResults ? JSON.stringify(assessmentResults) : 'No assessment yet'}
User Feedback: ${userFeedback || 'No feedback provided'}

Remaining weeks in roadmap:
${JSON.stringify(
  currentRoadmap.weeks
    .filter((w) => !w.topics.every((t) => t.completed))
    .slice(0, 4)
    .map((w) => ({ week: w.week, title: w.title, topics: w.topics.map((t) => t.title) })),
  null,
  2
)}

Based on this analysis, suggest adaptations. Respond with ONLY valid JSON:
{
  "adaptationReason": "Why the roadmap is being adapted (2-3 sentences)",
  "changes": "What specifically is changing and why",
  "updatedWeeks": [
    {
      "week": <number>,
      "title": "Updated week title",
      "description": "Updated description",
      "topics": [
        {"title": "Topic", "description": "Description", "completed": false}
      ],
      "tasks": [
        {"title": "Task", "type": "practice", "completed": false}
      ],
      "estimatedHours": 8
    }
  ],
  "skipTopics": ["topics to skip - already mastered"],
  "addedFocus": ["areas that need more attention"]
}

Return ONLY the JSON object, no other text.`;

  const raw = await callGranite(prompt, 2000);
  return parseJSON(raw);
};

export default {
  generateLearningRoadmap,
  generateCourseRecommendations,
  generateSkillAssessment,
  evaluateAssessment,
  generateAIChatResponse,
  analyzeLearningProgress,
  adaptLearningRoadmap,
};
