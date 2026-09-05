import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    // Onboarding fields
    learningGoal: { type: String, default: '' },
    learningStyle: {
      type: String,
      enum: ['visual', 'reading', 'hands-on', 'video', 'mixed'],
      default: 'mixed',
    },
    studyHoursPerWeek: { type: Number, default: 5 },
    interests: [{ type: String }],
    currentSkills: [{ type: String }],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    careerGoal: {
      type: String,
      enum: ['internship', 'job', 'freelancing', 'college-project', 'competitive-programming', 'career-switch', 'other'],
      default: 'job',
    },
    roadmapDuration: {
      type: String,
      enum: ['1-month', '3-months', '6-months', '1-year'],
      default: '3-months',
    },
    onboardingCompleted: { type: Boolean, default: false },
    activeRoadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
