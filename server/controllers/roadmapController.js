import Roadmap from '../models/Roadmap.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { generateLearningRoadmap, adaptLearningRoadmap } from '../services/graniteService.js';

// @desc    Generate a new roadmap using IBM Granite
// @route   POST /api/roadmap/generate
export const generateRoadmap = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Build profile for AI
    const userProfile = {
      name: user.name,
      learningGoal: user.learningGoal || req.body.learningGoal || 'Learn programming',
      interests: user.interests,
      currentSkills: user.currentSkills,
      skillLevel: user.skillLevel,
      careerGoal: user.careerGoal,
      studyHoursPerWeek: user.studyHoursPerWeek,
      roadmapDuration: user.roadmapDuration,
      learningStyle: user.learningStyle,
    };

    let aiRoadmap;
    try {
      aiRoadmap = await generateLearningRoadmap(userProfile);
    } catch (aiErr) {
      return res.status(503).json({ message: `AI service error: ${aiErr.message}` });
    }

    // Deactivate old roadmaps
    await Roadmap.updateMany({ userId: user._id, status: 'active' }, { status: 'paused' });

    const roadmap = await Roadmap.create({
      userId: user._id,
      title: aiRoadmap.title,
      goal: aiRoadmap.goal,
      duration: aiRoadmap.duration,
      weeks: aiRoadmap.weeks,
      status: 'active',
    });

    // Mark first week as current
    if (roadmap.weeks.length > 0) {
      roadmap.weeks[0].isCurrentWeek = true;
      await roadmap.save();
    }

    // Count total topics and tasks
    const totalTopics = roadmap.weeks.reduce((acc, w) => acc + w.topics.length, 0);
    const totalTasks = roadmap.weeks.reduce((acc, w) => acc + w.tasks.length, 0);

    // Update/create progress
    await Progress.findOneAndUpdate(
      { userId: user._id },
      {
        roadmapId: roadmap._id,
        totalTopics,
        totalTasks,
        completedTopics: [],
        completedTasks: [],
      },
      { upsert: true, new: true }
    );

    // Set active roadmap on user
    await User.findByIdAndUpdate(user._id, { activeRoadmapId: roadmap._id, onboardingCompleted: true });

    res.status(201).json({ roadmap, message: 'Roadmap generated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's active roadmap
// @route   GET /api/roadmap
export const getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!roadmap) {
      return res.status(404).json({ message: 'No active roadmap found' });
    }
    res.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

// @desc    Get roadmap by ID
// @route   GET /api/roadmap/:id
export const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

// @desc    Update roadmap progress (mark topic/task complete)
// @route   PUT /api/roadmap/:id/progress
export const updateRoadmapProgress = async (req, res, next) => {
  try {
    const { weekIndex, topicId, taskId, completed } = req.body;
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const week = roadmap.weeks[weekIndex];
    if (!week) {
      return res.status(400).json({ message: 'Week not found' });
    }

    let topicTitle = null;
    let taskTitle = null;

    if (topicId !== undefined) {
      const topic = week.topics.id(topicId);
      if (topic) {
        topic.completed = completed;
        topic.completedAt = completed ? new Date() : null;
        topicTitle = topic.title;
      }
    }

    if (taskId !== undefined) {
      const task = week.tasks.id(taskId);
      if (task) {
        task.completed = completed;
        task.completedAt = completed ? new Date() : null;
        taskTitle = task.title;
      }
    }

    await roadmap.save();

    // Sync progress document
    const progress = await Progress.findOne({ userId: req.user._id });
    if (progress) {
      if (topicTitle) {
        if (completed && !progress.completedTopics.includes(topicTitle)) {
          progress.completedTopics.push(topicTitle);
        } else if (!completed) {
          progress.completedTopics = progress.completedTopics.filter((t) => t !== topicTitle);
        }
      }
      if (taskTitle) {
        if (completed && !progress.completedTasks.includes(taskTitle)) {
          progress.completedTasks.push(taskTitle);
        } else if (!completed) {
          progress.completedTasks = progress.completedTasks.filter((t) => t !== taskTitle);
        }
      }
      progress.lastActivity = new Date();

      // Update streak
      const today = new Date();
      const lastAct = progress.lastActivity;
      if (lastAct) {
        const diff = Math.floor((today - lastAct) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          progress.currentStreak += 1;
        } else {
          progress.currentStreak = 1;
        }
        if (progress.currentStreak > progress.longestStreak) {
          progress.longestStreak = progress.currentStreak;
        }
      }
      progress.lastActivity = today;
      await progress.save();
    }

    res.json({ roadmap, message: 'Progress updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Adapt roadmap using IBM Granite
// @route   POST /api/roadmap/adapt
export const adaptRoadmap = async (req, res, next) => {
  try {
    const { feedback } = req.body;
    const user = await User.findById(req.user._id);
    const roadmap = await Roadmap.findOne({ userId: req.user._id, status: 'active' });
    const progress = await Progress.findOne({ userId: req.user._id });

    if (!roadmap) {
      return res.status(404).json({ message: 'No active roadmap found' });
    }

    const progressData = {
      completedTopics: progress?.completedTopics || [],
      totalTopics: progress?.totalTopics || 0,
      weakAreas: req.body.weakAreas || [],
      latestAssessment: req.body.latestAssessment || null,
    };

    const userProfile = {
      name: user.name,
      learningGoal: user.learningGoal,
      skillLevel: user.skillLevel,
      studyHoursPerWeek: user.studyHoursPerWeek,
      interests: user.interests,
    };

    const adaptation = await adaptLearningRoadmap(userProfile, roadmap, progressData, feedback);

    // Update future weeks in the roadmap
    if (adaptation.updatedWeeks && Array.isArray(adaptation.updatedWeeks)) {
      adaptation.updatedWeeks.forEach((updatedWeek) => {
        const weekIdx = roadmap.weeks.findIndex((w) => w.week === updatedWeek.week);
        if (weekIdx !== -1 && !roadmap.weeks[weekIdx].topics.every((t) => t.completed)) {
          roadmap.weeks[weekIdx].title = updatedWeek.title || roadmap.weeks[weekIdx].title;
          roadmap.weeks[weekIdx].description = updatedWeek.description || roadmap.weeks[weekIdx].description;

          // Only update incomplete topics
          if (updatedWeek.topics && updatedWeek.topics.length > 0) {
            const completedTopics = roadmap.weeks[weekIdx].topics.filter((t) => t.completed);
            roadmap.weeks[weekIdx].topics = [
              ...completedTopics,
              ...updatedWeek.topics.filter((t) => !t.completed),
            ];
          }
        }
      });
    }

    // Add adaptation log entry
    roadmap.adaptationLog.push({
      date: new Date(),
      reason: adaptation.adaptationReason || 'AI adaptation based on progress',
      changes: adaptation.changes || 'Roadmap updated',
    });

    await roadmap.save();

    res.json({
      roadmap,
      adaptation: {
        reason: adaptation.adaptationReason,
        changes: adaptation.changes,
        skipTopics: adaptation.skipTopics,
        addedFocus: adaptation.addedFocus,
      },
      message: 'Roadmap adapted successfully',
    });
  } catch (error) {
    next(error);
  }
};
