import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { roadmapAPI, progressAPI, aiAPI } from '../services/api.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { CheckCircle, Circle, ChevronDown, ChevronRight, RefreshCw, Zap, Map, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const WeekCard = ({ week, weekIndex, roadmapId, onUpdate }) => {
  const [expanded, setExpanded] = useState(week.isCurrentWeek);
  const [updating, setUpdating] = useState(null);

  const allTopicsComplete = week.topics.every((t) => t.completed);
  const completedCount = week.topics.filter((t) => t.completed).length;

  const toggleTopic = async (topicId, currentValue) => {
    setUpdating(`topic-${topicId}`);
    try {
      const res = await roadmapAPI.updateProgress(roadmapId, {
        weekIndex,
        topicId,
        completed: !currentValue,
      });
      onUpdate(res.data.roadmap);
      toast.success(!currentValue ? 'Topic marked complete! 🎉' : 'Topic unmarked');
    } catch (err) {
      toast.error('Failed to update progress');
    } finally {
      setUpdating(null);
    }
  };

  const toggleTask = async (taskId, currentValue) => {
    setUpdating(`task-${taskId}`);
    try {
      const res = await roadmapAPI.updateProgress(roadmapId, {
        weekIndex,
        taskId,
        completed: !currentValue,
      });
      onUpdate(res.data.roadmap);
      toast.success(!currentValue ? 'Task done! ✅' : 'Task unmarked');
    } catch (err) {
      toast.error('Failed to update progress');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className={`card border-2 transition-all ${week.isCurrentWeek ? 'border-primary-200' : allTopicsComplete ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${allTopicsComplete ? 'bg-green-500 text-white' : week.isCurrentWeek ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {allTopicsComplete ? '✓' : week.week}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">{week.title}</p>
            <p className="text-xs text-gray-500">{completedCount}/{week.topics.length} topics · {week.estimatedHours}h</p>
          </div>
          {week.isCurrentWeek && <span className="badge bg-primary-100 text-primary-700 text-xs ml-2">Current</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-24">
            <ProgressBar value={completedCount} max={Math.max(week.topics.length, 1)} size="sm" />
          </div>
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          {week.description && <p className="text-sm text-gray-500">{week.description}</p>}

          {/* Topics */}
          {week.topics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Topics</p>
              <div className="space-y-1.5">
                {week.topics.map((topic) => (
                  <div key={topic._id} className="flex items-start gap-3 group">
                    <button
                      onClick={() => toggleTopic(topic._id, topic.completed)}
                      disabled={updating === `topic-${topic._id}`}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {updating === `topic-${topic._id}` ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                      ) : topic.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 group-hover:text-primary-400 transition-colors" />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${topic.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {topic.title}
                      </p>
                      {topic.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {week.tasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Tasks & Exercises</p>
              <div className="space-y-1.5">
                {week.tasks.map((task) => (
                  <div key={task._id} className="flex items-center gap-3 group">
                    <button
                      onClick={() => toggleTask(task._id, task.completed)}
                      disabled={updating === `task-${task._id}`}
                      className="flex-shrink-0"
                    >
                      {updating === `task-${task._id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                      ) : task.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex items-center gap-2 flex-1">
                      <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {task.title}
                      </p>
                      <span className="badge bg-gray-100 text-gray-500 text-xs">{task.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adapting, setAdapting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showAdaptForm, setShowAdaptForm] = useState(false);
  const [adaptationResult, setAdaptationResult] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roadmapAPI.get();
      setRoadmap(res.data.roadmap);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('no-roadmap');
      } else {
        setError(err.response?.data?.message || 'Failed to load roadmap');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdapt = async () => {
    setAdapting(true);
    try {
      const res = await roadmapAPI.adapt({ feedback });
      setRoadmap(res.data.roadmap);
      setAdaptationResult(res.data.adaptation);
      setShowAdaptForm(false);
      setFeedback('');
      toast.success('Roadmap adapted by IBM Granite AI! 🤖');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to adapt roadmap';
      if (msg.includes('IBM') || msg.includes('configured')) {
        toast.error('IBM Granite not configured. Add credentials to server .env');
      } else {
        toast.error(msg);
      }
    } finally {
      setAdapting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (error === 'no-roadmap') {
    return (
      <DashboardLayout>
        <EmptyState
          icon={<Map className="h-16 w-16 text-gray-300" />}
          title="No Roadmap Yet"
          description="Complete your onboarding to generate a personalized roadmap"
          action={<a href="/onboarding" className="btn-primary">Generate Roadmap</a>}
        />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage message={error} onRetry={fetchRoadmap} />
      </DashboardLayout>
    );
  }

  const totalTopics = roadmap.weeks.reduce((acc, w) => acc + w.topics.length, 0);
  const completedTopics = roadmap.weeks.reduce((acc, w) => acc + w.topics.filter((t) => t.completed).length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{roadmap.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{roadmap.goal} · {roadmap.duration}</p>
          </div>
          <button
            onClick={() => setShowAdaptForm(!showAdaptForm)}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Zap className="h-4 w-4" />
            Adapt with AI
          </button>
        </div>

        {/* Overall progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-sm font-bold text-primary-600">{completedTopics}/{totalTopics} topics</span>
          </div>
          <ProgressBar value={completedTopics} max={Math.max(totalTopics, 1)} showLabel size="lg" label="Roadmap Completion" />
        </div>

        {/* AI Adapt Form */}
        {showAdaptForm && (
          <div className="card border-primary-200 bg-primary-50">
            <h3 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Adapt Roadmap with IBM Granite AI
            </h3>
            <p className="text-sm text-gray-600 mb-3">Share feedback about your learning and AI will update your future weeks accordingly.</p>
            <textarea
              className="input-field mb-3 h-24 resize-none"
              placeholder="e.g. I'm struggling with async JavaScript, I want more React practice, I have more time this week..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleAdapt} disabled={adapting} className="btn-primary flex items-center gap-2 text-sm">
                {adapting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {adapting ? 'Adapting...' : 'Adapt My Roadmap'}
              </button>
              <button onClick={() => setShowAdaptForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* Adaptation result */}
        {adaptationResult && (
          <div className="card border-green-200 bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">🤖 AI Adaptation Applied</h3>
            <p className="text-sm text-gray-700 mb-2">{adaptationResult.reason}</p>
            <p className="text-sm text-gray-600">{adaptationResult.changes}</p>
            {adaptationResult.addedFocus?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {adaptationResult.addedFocus.map((f) => (
                  <span key={f} className="badge bg-green-100 text-green-700 text-xs">{f}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Weeks */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Weekly Breakdown</h2>
          {roadmap.weeks.map((week, idx) => (
            <WeekCard
              key={week._id || idx}
              week={week}
              weekIndex={idx}
              roadmapId={roadmap._id}
              onUpdate={(updatedRoadmap) => setRoadmap(updatedRoadmap)}
            />
          ))}
        </div>

        {/* Adaptation log */}
        {roadmap.adaptationLog?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Adaptation History</h3>
            <div className="space-y-3">
              {roadmap.adaptationLog.slice(-3).map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">{log.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Roadmap;
