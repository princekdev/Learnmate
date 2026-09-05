import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI, roadmapAPI } from '../services/api.js';
import { GraduationCap, Loader2, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const INTERESTS = [
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'React', 'Node.js', 'Cybersecurity', 'UI/UX', 'Data Science',
  'AI/ML', 'Cloud Computing', 'DevOps', 'Python', 'Java', 'C++', 'Other',
];

const SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Express.js', 'Python', 'Django', 'Flask', 'Java', 'Spring',
  'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'Linux', 'C/C++', 'Data Analysis',
];

const steps = ['Personal Info', 'Interests', 'Skills', 'Career Goals'];

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const [form, setForm] = useState({
    learningGoal: user?.learningGoal || '',
    learningStyle: user?.learningStyle || 'mixed',
    studyHoursPerWeek: user?.studyHoursPerWeek || 5,
    interests: user?.interests || [],
    currentSkills: user?.currentSkills || [],
    skillLevel: user?.skillLevel || 'beginner',
    careerGoal: user?.careerGoal || 'job',
    roadmapDuration: user?.roadmapDuration || '3-months',
  });

  const toggleItem = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((i) => i !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (step === 0 && !form.learningGoal) {
      toast.error('Please enter your learning goal');
      return;
    }
    if (step === 1 && form.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await userAPI.updateProfile({ ...form, onboardingCompleted: true });
      updateUser(res.data.user);

      setGeneratingRoadmap(true);
      toast.loading('IBM Granite AI is generating your personalized roadmap...', { id: 'roadmap-gen', duration: 60000 });

      const roadmapRes = await roadmapAPI.generate({});
      toast.success('Your personalized roadmap is ready!', { id: 'roadmap-gen' });

      navigate('/dashboard');
    } catch (err) {
      toast.dismiss('roadmap-gen');
      const msg = err.response?.data?.message || 'Something went wrong';
      if (msg.includes('IBM') || msg.includes('configured')) {
        toast.error('IBM Granite is not configured. Please add IBM credentials to server .env', { duration: 8000 });
      } else {
        toast.error(msg);
      }
      // Still navigate to dashboard even if roadmap gen fails
      navigate('/dashboard');
    } finally {
      setLoading(false);
      setGeneratingRoadmap(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LearnMate</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Up Your Learning Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Help IBM Granite AI build your perfect roadmap</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < step ? 'bg-primary-600 border-primary-600 text-white' : i === step ? 'border-primary-600 text-primary-600' : 'border-gray-300 text-gray-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <div>
                <label className="label">What do you want to learn? *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Become a full stack developer, Learn Data Science..."
                  value={form.learningGoal}
                  onChange={(e) => setForm({ ...form, learningGoal: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Preferred Learning Style</label>
                  <select
                    className="input-field"
                    value={form.learningStyle}
                    onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}
                  >
                    <option value="mixed">Mixed</option>
                    <option value="visual">Visual</option>
                    <option value="reading">Reading / Text</option>
                    <option value="hands-on">Hands-on / Projects</option>
                    <option value="video">Video Tutorials</option>
                  </select>
                </div>
                <div>
                  <label className="label">Study Hours Per Week</label>
                  <input
                    type="number"
                    className="input-field"
                    min="1"
                    max="80"
                    value={form.studyHoursPerWeek}
                    onChange={(e) => setForm({ ...form, studyHoursPerWeek: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Select Your Interests *</h2>
              <p className="text-sm text-gray-500">Choose all that apply. IBM Granite will use these to personalize your roadmap.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleItem('interests', interest)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      form.interests.includes(interest)
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <div>
                <label className="label">Current Skill Level</label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, skillLevel: level })}
                      className={`py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${
                        form.skillLevel === level
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">What skills do you already have?</h2>
              <p className="text-sm text-gray-500">Select all skills you're already comfortable with.</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleItem('currentSkills', skill)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      form.currentSkills.includes(skill)
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-green-400'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Career Goals */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Career Goals & Timeline</h2>
              <div>
                <label className="label">Career Goal</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'internship', label: '🎯 Internship' },
                    { value: 'job', label: '💼 Full-time Job' },
                    { value: 'freelancing', label: '💻 Freelancing' },
                    { value: 'college-project', label: '🎓 College Project' },
                    { value: 'competitive-programming', label: '🏆 Competitive' },
                    { value: 'career-switch', label: '🔄 Career Switch' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, careerGoal: value })}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all text-left ${
                        form.careerGoal === value
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Preferred Roadmap Duration</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: '1-month', label: '1 Month' },
                    { value: '3-months', label: '3 Months' },
                    { value: '6-months', label: '6 Months' },
                    { value: '1-year', label: '1 Year' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, roadmapDuration: value })}
                      className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                        form.roadmapDuration === value
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {generatingRoadmap && (
                <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  <div>
                    <p className="text-sm font-semibold text-primary-700">IBM Granite AI is generating your roadmap...</p>
                    <p className="text-xs text-primary-500">This may take 15-30 seconds</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}
            {step < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {loading ? 'Generating Roadmap...' : 'Generate My Roadmap'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
