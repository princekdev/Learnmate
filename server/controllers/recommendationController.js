import Recommendation from '../models/Recommendation.js';
import Progress from '../models/Progress.js';
import { generateCourseRecommendations } from '../services/graniteService.js';

// @desc    Get user's recommendations
// @route   GET /api/recommendations
export const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate and save AI recommendations
// @route   POST /api/recommendations/generate
export const generateRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    const progress = await Progress.findOne({ userId: user._id });

    const progressData = {
      completedTopics: progress?.completedTopics || [],
      weakAreas: req.body.weakAreas || [],
    };

    let aiRecs;
    try {
      aiRecs = await generateCourseRecommendations(user.toJSON(), progressData);
    } catch (aiErr) {
      return res.status(503).json({ message: `AI service error: ${aiErr.message}` });
    }

    // Remove old AI-generated recommendations and replace
    await Recommendation.deleteMany({ userId: user._id, isAiGenerated: true });

    const saved = await Recommendation.insertMany(
      aiRecs.map((r) => ({
        userId: user._id,
        title: r.title,
        topic: r.topic,
        difficulty: r.difficulty || 'beginner',
        reason: r.reason,
        estimatedTime: r.estimatedTime,
        resourceUrl: r.resourceUrl || '',
        resourceType: r.resourceType || 'course',
        isAiGenerated: true,
      }))
    );

    res.json({ recommendations: saved, message: 'Recommendations generated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/unsave a recommendation
// @route   PUT /api/recommendations/:id/save
export const toggleSaveRecommendation = async (req, res, next) => {
  try {
    const rec = await Recommendation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!rec) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    rec.isSaved = !rec.isSaved;
    await rec.save();
    res.json({ recommendation: rec, message: rec.isSaved ? 'Saved' : 'Unsaved' });
  } catch (error) {
    next(error);
  }
};
