import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, default: 'practice' }, // practice | reading | project | quiz
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const weekSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  topics: [topicSchema],
  tasks: [taskSchema],
  estimatedHours: { type: Number, default: 8 },
  isCurrentWeek: { type: Boolean, default: false },
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    goal: { type: String, required: true },
    duration: { type: String, required: true },
    weeks: [weekSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
    adaptationLog: [
      {
        date: { type: Date, default: Date.now },
        reason: { type: String },
        changes: { type: String },
      },
    ],
    aiGeneratedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Roadmap', roadmapSchema);
