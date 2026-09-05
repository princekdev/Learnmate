import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI, roadmapAPI } from '../services/api.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { User, Save, Loader2, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const INTERESTS = [
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'React', 'Node.js', 'Cybersecurity', 'UI/UX', 'Data Science',
  'AI/ML', 'Cloud Computing', 'DevOps', 'Python', 'Java', 'C++',
];

const SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Django',
  'Java', 'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'Linux',
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    learningGoal: user?.learningGoal || '',
    learningStyle: user?.learningStyle || 'mixed',
    studyHoursPerWeek: user?.studyHoursPerWeek || 5,
    interests: user?.interests || [],
    currentSkills: user?.currentSkills || [],
    skillLevel: user?.skillLevel || 'beginner',
    careerGoal: user?.careerGoal || 'job',
    roadmapDuration: user?.roadmapDuration || '3-months',
  });
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const toggleItem = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((i) => i !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setRegenerating(true);
    try {
      // Save profile first
      const profileRes = await userAPI.updateProfile(form);
      updateUser(profileRes.data.user);
      // Then regenerate
      toast.loading('IBM Granite AI is regenerating your roadmap...', { id: 'regen', duration: 60000 });
      await roadmapAPI.generate({});
      toast.success('Roadmap regenerated successfully!', { id: 'regen' });
    } catch (err) {
      toast.dismiss('regen');
      const msg = err.response?.data?.message || 'Failed to regenerate roadmap';
      if (msg.includes('IBM') || msg.includes('configured')) {
        toast.error('IBM Granite not configured. Add credentials to server .env');
      } else {
        toast.error(msg);
      }
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Update your learning preferences</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleRegenerateRoadmap} disabled={regenerating} className="btn-outline text-sm flex items-center gap-2">
              {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Regenerate Roadmap
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="card flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`badge mt-1 text-xs ${user?.skillLevel === 'advanced' ? 'bg-purple-100 text-purple-700' : user?.skillLevel === 'intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {user?.skillLevel}
            </span>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Learning Goal</label>
              <input type="text" className="input-field" placeholder="What do you want to achieve?" value={form.learningGoal} onChange={(e) => setForm({ ...form, learningGoal: e.target.value })} />
            </div>
            <div>
              <label className="label">Learning Style</label>
              <select className="input-field" value={form.learningStyle} onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}>
                <option value="mixed">Mixed</option>
                <option value="visual">Visual</option>
                <option value="reading">Reading / Text</option>
                <option value="hands-on">Hands-on / Projects</option>
                <option value="video">Video Tutorials</option>
              </select>
            </div>
            <div>
              <label className="label">Study Hours Per Week</label>
              <input type="number" className="input-field" min="1" max="80" value={form.studyHoursPerWeek} onChange={(e) => setForm({ ...form, studyHoursPerWeek: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Skill Level */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Skill Level</h2>
          <div className="grid grid-cols-3 gap-3">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button key={level} type="button" onClick={() => setForm({ ...form, skillLevel: level })}
                className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all ${form.skillLevel === level ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400'}`}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button key={interest} type="button" onClick={() => toggleItem('interests', interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.interests.includes(interest) ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400'}`}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Current Skills */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Current Skills</h2>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <button key={skill} type="button" onClick={() => toggleItem('currentSkills', skill)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.currentSkills.includes(skill) ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-green-400'}`}>
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Career Goal & Duration */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Career Goals</h2>
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
                <button key={value} type="button" onClick={() => setForm({ ...form, careerGoal: value })}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all text-left ${form.careerGoal === value ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Roadmap Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {[{ value: '1-month', label: '1 Month' }, { value: '3-months', label: '3 Months' }, { value: '6-months', label: '6 Months' }, { value: '1-year', label: '1 Year' }].map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm({ ...form, roadmapDuration: value })}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${form.roadmapDuration === value ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
