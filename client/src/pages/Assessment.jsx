import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { assessmentAPI } from '../services/api.js';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Brain, CheckCircle, XCircle, Loader2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const DOMAINS = ['JavaScript', 'React', 'Node.js', 'Python', 'HTML/CSS', 'SQL', 'Cybersecurity', 'Cloud Computing', 'AI/ML', 'Data Science', 'Java', 'Git'];

const Assessment = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState('select'); // select | taking | result | history
  const [selectedDomain, setSelectedDomain] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await assessmentAPI.history();
      setHistory(res.data.assessments);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const startAssessment = async () => {
    if (!selectedDomain) { toast.error('Please select a domain'); return; }
    setLoading(true);
    try {
      const res = await assessmentAPI.generate({ domain: selectedDomain });
      setAssessment(res.data);
      setAnswers(new Array(res.data.questions.length).fill(''));
      setPhase('taking');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate assessment';
      if (msg.includes('IBM') || msg.includes('configured')) {
        toast.error('IBM Granite not configured. Please add IBM credentials to server .env');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAssessment = async () => {
    setLoading(true);
    try {
      const res = await assessmentAPI.submit({ assessmentId: assessment.assessmentId, answers });
      setResult(res.data.assessment);
      setPhase('result');
      toast.success('Assessment evaluated by IBM Granite AI!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setPhase('select');
    setAssessment(null);
    setAnswers([]);
    setResult(null);
    setSelectedDomain('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skill Assessment</h1>
            <p className="text-gray-500 text-sm mt-1">AI-powered assessments by IBM Granite</p>
          </div>
          <button
            onClick={() => { fetchHistory(); setPhase('history'); }}
            className="btn-secondary text-sm"
          >
            View History
          </button>
        </div>

        {/* Domain Selection */}
        {phase === 'select' && (
          <div className="card space-y-5">
            <h2 className="font-semibold text-gray-900">Select Assessment Domain</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    selectedDomain === domain
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-primary-400'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
            <button
              onClick={startAssessment}
              disabled={!selectedDomain || loading}
              className="btn-primary flex items-center gap-2 w-full justify-center py-3"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {loading ? 'Generating Questions...' : `Start ${selectedDomain || ''} Assessment`}
            </button>
          </div>
        )}

        {/* Taking Assessment */}
        {phase === 'taking' && assessment && (
          <div className="space-y-5">
            <div className="card bg-primary-50 border-primary-200">
              <p className="text-sm font-medium text-primary-700">{assessment.domain} Assessment · {assessment.totalQuestions} questions</p>
            </div>
            {assessment.questions.map((q, qIdx) => (
              <div key={q._id || qIdx} className="card">
                <p className="font-medium text-gray-900 mb-4">
                  <span className="text-primary-600 mr-2">Q{qIdx + 1}.</span>
                  {q.question}
                </p>
                {q.type === 'mcq' ? (
                  <div className="space-y-2">
                    {q.options.map((option) => (
                      <label key={option} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[qIdx] === option ? 'bg-primary-50 border-primary-400' : 'bg-gray-50 border-gray-200 hover:border-primary-300'}`}>
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          value={option}
                          checked={answers[qIdx] === option}
                          onChange={() => {
                            const newAnswers = [...answers];
                            newAnswers[qIdx] = option;
                            setAnswers(newAnswers);
                          }}
                          className="accent-primary-600"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="input-field h-24 resize-none"
                    placeholder="Type your answer here..."
                    value={answers[qIdx]}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[qIdx] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={submitAssessment} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {loading ? 'Evaluating...' : 'Submit Assessment'}
              </button>
              <button onClick={resetAssessment} className="btn-secondary px-5">Cancel</button>
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'result' && result && (
          <div className="space-y-5">
            <div className={`card text-center border-2 ${result.percentage >= 70 ? 'border-green-200 bg-green-50' : result.percentage >= 40 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
              <div className={`text-5xl font-bold mb-2 ${result.percentage >= 70 ? 'text-green-600' : result.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.percentage}%
              </div>
              <p className="text-lg font-semibold text-gray-900">{result.score}/{result.totalQuestions} correct</p>
              <p className="text-sm text-gray-600 mt-1">Skill Level: <span className="font-semibold capitalize">{result.skillLevel}</span></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.strengths?.length > 0 && (
                <div className="card border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Strengths</h3>
                  <ul className="space-y-1">{result.strengths.map((s) => <li key={s} className="text-sm text-gray-700">• {s}</li>)}</ul>
                </div>
              )}
              {result.weaknesses?.length > 0 && (
                <div className="card border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2"><XCircle className="h-4 w-4" /> Areas to Improve</h3>
                  <ul className="space-y-1">{result.weaknesses.map((w) => <li key={w} className="text-sm text-gray-700">• {w}</li>)}</ul>
                </div>
              )}
            </div>

            {result.recommendations && (
              <div className="card border-primary-200 bg-primary-50">
                <h3 className="font-semibold text-primary-900 mb-2">AI Recommendations</h3>
                <p className="text-sm text-gray-700">{result.recommendations}</p>
              </div>
            )}

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Question Review</h3>
              {result.questions?.map((q, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg mb-2 ${q.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  {q.isCorrect ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{q.question}</p>
                    {!q.isCorrect && <p className="text-xs text-red-600 mt-1">Your answer: {q.userAnswer}</p>}
                    {!q.isCorrect && <p className="text-xs text-green-700 mt-0.5">Correct: {q.correctAnswer}</p>}
                    {q.explanation && <p className="text-xs text-gray-500 mt-1 italic">{q.explanation}</p>}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={resetAssessment} className="btn-primary w-full flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" /> Take Another Assessment
            </button>
          </div>
        )}

        {/* History */}
        {phase === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Assessment History</h2>
              <button onClick={() => setPhase('select')} className="btn-secondary text-sm">New Assessment</button>
            </div>
            {historyLoading ? <LoadingSpinner /> : history.length === 0 ? (
              <EmptyState icon={<Brain className="h-10 w-10 text-gray-300" />} title="No assessments yet" description="Take your first skill assessment" />
            ) : (
              history.map((a) => (
                <div key={a._id} className="card flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{a.domain}</p>
                    <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-sm font-bold ${a.percentage >= 70 ? 'bg-green-100 text-green-700' : a.percentage >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {a.percentage}%
                    </span>
                    <span className="badge bg-gray-100 text-gray-700 capitalize text-xs">{a.skillLevel}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assessment;
