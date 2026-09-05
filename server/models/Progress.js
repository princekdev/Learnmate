import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },
    completedTopics: [{ type: String }],
    completedTasks: [{ type: String }],
    totalTopics: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    studyHoursLogged: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivity: { type: Date, default: null },
    weeklyProgress: [
      {
        weekNumber: Number,
        completedTopics: Number,
        totalTopics: Number,
        studyHours: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    skillImprovements: [
      {
        skill: String,
        previousLevel: String,
        newLevel: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);
