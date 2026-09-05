import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';

// @desc    Get user profile
// @route   GET /api/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('activeRoadmapId', 'title goal duration status');
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'learningGoal',
      'learningStyle',
      'studyHoursPerWeek',
      'interests',
      'currentSkills',
      'skillLevel',
      'careerGoal',
      'roadmapDuration',
      'onboardingCompleted',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle password change separately
    if (req.body.password) {
      const user = await User.findById(req.user._id);
      user.password = req.body.password;
      Object.assign(user, updates);
      await user.save();
      return res.json({ user: user.toJSON(), message: 'Profile updated successfully' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });

    res.json({ user: user.toJSON(), message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};
