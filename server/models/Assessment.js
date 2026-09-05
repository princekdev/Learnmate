import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short'], default: 'mcq' },
  options: [{ type: String }], // for MCQ
  correctAnswer: { type: String, default: '' },
  userAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
});

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain: { type: String, required: true },
    questions: [questionSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'submitted', 'evaluated'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Assessment', assessmentSchema);
