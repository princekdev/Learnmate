import Chat from '../models/Chat.js';
import Progress from '../models/Progress.js';
import Roadmap from '../models/Roadmap.js';
import { generateAIChatResponse, analyzeLearningProgress, generateCourseRecommendations } from '../services/graniteService.js';

// @desc    Send message to AI coach
// @route   POST /api/ai/chat
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = req.user;
    const progress = await Progress.findOne({ userId: user._id });
    const roadmap = await Roadmap.findOne({ userId: user._id, status: 'active' });

    // Get or create chat session
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: user._id });
    }
    if (!chat) {
      chat = await Chat.create({
        userId: user._id,
        title: message.substring(0, 50),
        messages: [],
      });
    }

    // Build progress context
    const progressData = {
      completedTopics: progress?.completedTopics || [],
      currentStreak: progress?.currentStreak || 0,
    };

    // Get AI response from IBM Granite
    let aiResponse;
    try {
      aiResponse = await generateAIChatResponse(message, user.toJSON(), chat.messages, progressData);
    } catch (aiErr) {
      return res.status(503).json({ message: `AI service error: ${aiErr.message}` });
    }

    // Save both messages
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'assistant', content: aiResponse });

    // Keep last 50 messages to avoid document bloat
    if (chat.messages.length > 50) {
      chat.messages = chat.messages.slice(-50);
    }

    await chat.save();

    // Update last activity
    await Progress.findOneAndUpdate({ userId: user._id }, { lastActivity: new Date() }, { upsert: true });

    res.json({
      chatId: chat._id,
      response: aiResponse,
      messages: chat.messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/ai/chat/:chatId
export const getChatHistory = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chats for user
// @route   GET /api/ai/chats
export const getAllChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title messages updatedAt')
      .limit(20);
    res.json({ chats });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat
// @route   DELETE /api/ai/chat/:chatId
export const deleteChat = async (req, res, next) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.chatId, userId: req.user._id });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate course recommendations using IBM Granite
// @route   POST /api/ai/recommend
export const getRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    const progress = await Progress.findOne({ userId: user._id });

    const progressData = {
      completedTopics: progress?.completedTopics || [],
      weakAreas: req.body.weakAreas || [],
    };

    let recommendations;
    try {
      recommendations = await generateCourseRecommendations(user.toJSON(), progressData);
    } catch (aiErr) {
      return res.status(503).json({ message: `AI service error: ${aiErr.message}` });
    }
    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze learning progress with IBM Granite
// @route   GET /api/ai/analyze
export const analyzeProgress = async (req, res, next) => {
  try {
    const user = req.user;
    const progress = await Progress.findOne({ userId: user._id });
    const roadmap = await Roadmap.findOne({ userId: user._id, status: 'active' });

    if (!roadmap) {
      return res.status(404).json({ message: 'No active roadmap found' });
    }

    const progressData = {
      completedTopics: progress?.completedTopics || [],
      totalTopics: progress?.totalTopics || 0,
      currentStreak: progress?.currentStreak || 0,
    };

    let analysis;
    try {
      analysis = await analyzeLearningProgress(user.toJSON(), roadmap, progressData);
    } catch (aiErr) {
      return res.status(503).json({ message: `AI service error: ${aiErr.message}` });
    }
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
};
