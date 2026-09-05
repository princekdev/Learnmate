import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { roadmapAPI, progressAPI, aiAPI } from '../services/api.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  Map, Brain, MessageSquare, BookOpen, TrendingUp, Zap, Target,
  Clock, Flame, CheckCircle, CircleDot, ArrowRight, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, title, value, color, sub }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progressRes, roadmapRes] = await Promise.allSettled([
        progressAPI.get(),
        roadmapAPI.get(),
      ]);
      if (progressRes.status === 'fulfilled') setProgress(progressRes.value.data.progress);
      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value.data.roadmap);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await aiAPI.analyze();
      setAnalysis(res.data.analysis);
      toast.success('AI analysis complete!');
    } catch (err) {
      const msg = err.response?.data?.message || 'AI analysis failed';
      if (msg.includes('IBM') || msg.includes('configured')) {
        toast.error('IBM Granite not configured. Add credentials to server .env');
      } else {
        toast.error(msg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const currentWeek = roadmap?.weeks?.find((w) => w.isCurrentWeek) || roadmap?.weeks?.[0];
  const completedTopicsCount = progress?.completedTopics?.length || 0;
  const totalTopics = progress?.totalTopics || 0;
  const progressPct = progress?.percentage || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.learningGoal || 'Set your learning goal in Profile'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${
              user?.skillLevel === 'advanced' ? 'bg-purple-100 text-purple-700' :
              user?.skillLevel === 'intermediate' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {user?.skillLevel || 'beginner'}
            </span>
            {roadmap && (
              <button onClick={handleAnalyze} disabled={analyzing} className="btn-outline text-sm flex items-center gap-2">
                {analyzing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                AI Analyze
              </button>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle} title="Topics Completed" value={completedTopicsCount} color="bg-green-500" sub={`of ${totalTopics} total`} />
          <StatCard icon={TrendingUp} title="Overall Progress" value={`${progressPct}%`} color="bg-primary-600" sub="roadmap completion" />
          <StatCard icon={Flame} title="Current Streak" value={`${progress?.currentStreak || 0}d`} color="bg-orange-500" sub="keep it going!" />
          <StatCard icon={Clock} title="Study Hours" value={progress?.studyHoursLogged || 0} color="bg-secondary-500" sub="hours logged" />
        </div>

        {/* Progress bar */}
        {roadmap && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">{roadmap.title}</h2>
              <span className="text-sm text-gray-500">{roadmap.duration}</span>
            </div>
            <ProgressBar value={completedTopicsCount} max={Math.max(totalTopics, 1)} showLabel size="lg" label="Overall Progress" />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Target className="h-4 w-4" /> Goal: {roadmap.goal}</span>
              <span className="flex items-center gap-1"><Map className="h-4 w-4" /> {roadmap.weeks?.length} weeks</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Week */}
          <div className="lg:col-span-2">
            {currentWeek ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Current Week: {currentWeek.title}</h2>
                  <Link to="/roadmap" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {currentWeek.topics.slice(0, 5).map((topic) => (
                    <div key={topic._id} className={`flex items-center gap-3 p-2.5 rounded-lg ${topic.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                      {topic.completed
                        ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        : <CircleDot className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      }
                      <span className={`text-sm ${topic.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {topic.title}
                      </span>
                    </div>
                  ))}
                  {currentWeek.topics.length > 5 && (
                    <p className="text-xs text-gray-400 pl-3">+{currentWeek.topics.length - 5} more topics</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="card">
                <EmptyState
                  icon={<Map className="h-12 w-12 text-gray-300" />}
                  title="No Roadmap Yet"
                  description="Complete onboarding to generate your personalized roadmap"
                  action={<Link to="/onboarding" className="btn-primary text-sm">Generate Roadmap</Link>}
                />
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            {[
              { to: '/ai-coach', icon: MessageSquare, label: 'Ask AI Coach', desc: 'Get instant learning help', color: 'bg-primary-100 text-primary-700' },
              { to: '/assessment', icon: Brain, label: 'Take Assessment', desc: 'Test your knowledge', color: 'bg-purple-100 text-purple-700' },
              { to: '/recommendations', icon: BookOpen, label: 'View Resources', desc: 'Curated learning materials', color: 'bg-orange-100 text-orange-700' },
            ].map(({ to, icon: Icon, label, desc, color }) => (
              <Link key={to} to={to} className="card flex items-center gap-4 hover:border-primary-200 hover:shadow-md transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-primary-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="card border-primary-200 bg-primary-50">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary-600" />
              <h2 className="font-semibold text-primary-900">AI Learning Analysis</h2>
            </div>
            <p className="text-sm text-gray-700 mb-4">{analysis.progressSummary}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.nextRecommendedTopic && (
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Next Recommended Topic</p>
                  <p className="text-sm font-semibold text-gray-900">{analysis.nextRecommendedTopic}</p>
                </div>
              )}
              {analysis.motivationalMessage && (
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Coach Says</p>
                  <p className="text-sm text-gray-700 italic">"{analysis.motivationalMessage}"</p>
                </div>
              )}
            </div>
            {analysis.insights && analysis.insights.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Insights</p>
                <ul className="space-y-1">
                  {analysis.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">•</span>{insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
