import React, { useEffect, useState } from 'react';
import { progressAPI, assessmentAPI } from '../services/api.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { TrendingUp, Flame, Clock, CheckCircle, Brain, Target } from 'lucide-react';

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [progressRes, assessRes] = await Promise.allSettled([
          progressAPI.get(),
          assessmentAPI.history(),
        ]);
        if (progressRes.status === 'fulfilled') setProgress(progressRes.value.data.progress);
        if (assessRes.status === 'fulfilled') setAssessments(assessRes.value.data.assessments.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  const progressPct = progress?.percentage || 0;
  const completedTopics = progress?.completedTopics?.length || 0;
  const totalTopics = progress?.totalTopics || 0;
  const completedTasks = progress?.completedTasks?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Progress</h1>
          <p className="text-gray-500 text-sm mt-1">Track your learning journey and achievements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Progress', value: `${progressPct}%`, color: 'text-primary-600', bg: 'bg-primary-50' },
            { icon: Flame, label: 'Streak', value: `${progress?.currentStreak || 0} days`, color: 'text-orange-600', bg: 'bg-orange-50' },
            { icon: CheckCircle, label: 'Topics Done', value: `${completedTopics}/${totalTopics}`, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Clock, label: 'Study Hours', value: progress?.studyHoursLogged || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap progress */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Roadmap Completion</h2>
          <ProgressBar value={completedTopics} max={Math.max(totalTopics, 1)} showLabel size="lg" label={`${completedTopics} of ${totalTopics} topics completed`} />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{completedTopics}</p>
              <p className="text-xs text-gray-500">Topics Completed</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary-600">{completedTasks}</p>
              <p className="text-xs text-gray-500">Tasks Completed</p>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" /> Learning Streak
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-4xl font-bold text-orange-600">{progress?.currentStreak || 0}</p>
              <p className="text-sm text-orange-700 mt-1">Current Streak</p>
              <p className="text-xs text-gray-500">consecutive days</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-4xl font-bold text-orange-500">{progress?.longestStreak || 0}</p>
              <p className="text-sm text-orange-700 mt-1">Longest Streak</p>
              <p className="text-xs text-gray-500">personal best</p>
            </div>
          </div>
          {progress?.lastActivity && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              Last activity: {new Date(progress.lastActivity).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Assessment history */}
        {assessments.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" /> Recent Assessments
            </h2>
            <div className="space-y-3">
              {assessments.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{a.domain}</p>
                    <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={a.percentage} max={100} size="sm" />
                    <span className={`badge text-sm font-bold ml-2 ${a.percentage >= 70 ? 'bg-green-100 text-green-700' : a.percentage >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {a.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed topics list */}
        {progress?.completedTopics?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" /> Completed Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {progress.completedTopics.map((topic) => (
                <span key={topic} className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Progress;
