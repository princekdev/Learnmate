import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    reason: { type: String, default: '' },
    estimatedTime: { type: String, default: '' },
    resourceUrl: { type: String, default: '' },
    resourceType: { type: String, default: 'course' }, // course | article | video | practice
    isAiGenerated: { type: Boolean, default: true },
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Recommendation', recommendationSchema);
