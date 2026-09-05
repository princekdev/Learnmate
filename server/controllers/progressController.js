import Progress from '../models/Progress.js';
import Roadmap from '../models/Roadmap.js';

// @desc    Get user's progress
// @route   GET /api/progress
export const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id });
    const roadmap = await Roadmap.findOne({ userId: req.user._id, status: 'active' });

    if (!progress) {
      return res.json({
        progress: {
          completedTopics: [],
          completedTasks: [],
          totalTopics: 0,
          totalTasks: 0,
          studyHoursLogged: 0,
          currentStreak: 0,
          lastActivity: null,
          percentage: 0,
        },
      });
    }

    const percentage =
      progress.totalTopics > 0
        ? Math.round((progress.completedTopics.length / progress.totalTopics) * 100)
        : 0;

    res.json({
      progress: {
        ...progress.toObject(),
        percentage,
        roadmapTitle: roadmap?.title || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress (log study hours etc.)
// @route   PUT /api/progress
export const updateProgress = async (req, res, next) => {
  try {
    const { studyHoursLogged } = req.body;

    const update = { lastActivity: new Date() };
    if (studyHoursLogged) {
      update.$inc = { studyHoursLogged };
    }

    const progress = await Progress.findOneAndUpdate({ userId: req.user._id }, update, {
      new: true,
      upsert: true,
    });

    res.json({ progress, message: 'Progress updated' });
  } catch (error) {
    next(error);
  }
};
