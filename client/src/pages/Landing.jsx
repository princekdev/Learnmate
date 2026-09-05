import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Brain, Map, MessageSquare, TrendingUp, ChevronRight, Zap, Target, Users, Star, ArrowRight, BookOpen, Shield, Clock } from 'lucide-react';

const domains = [
  'Frontend Development', 'Backend Development', 'Full Stack', 'React & Node.js',
  'Cybersecurity', 'UI/UX Design', 'Data Science', 'AI & Machine Learning',
  'Cloud Computing', 'DevOps', 'Python', 'Java',
];

const features = [
  { icon: Brain, title: 'AI-Powered Roadmaps', desc: 'IBM Granite generates personalized learning paths based on your unique goals and skills.' },
  { icon: MessageSquare, title: 'AI Chat Coach', desc: 'Get instant answers and guidance from your personal AI learning coach, anytime.' },
  { icon: TrendingUp, title: 'Adaptive Learning', desc: 'The roadmap continuously evolves based on your progress, quiz results, and feedback.' },
  { icon: Target, title: 'Skill Assessment', desc: 'AI-generated quizzes evaluate your strengths and identify areas for improvement.' },
  { icon: BookOpen, title: 'Smart Recommendations', desc: 'Get curated course and resource recommendations tailored to your learning stage.' },
  { icon: Shield, title: 'Progress Tracking', desc: 'Track streaks, completed topics, study hours, and skill improvements over time.' },
];

const steps = [
  { step: '01', title: 'Sign Up & Onboard', desc: 'Tell us your goals, interests, skill level, and how much time you have.' },
  { step: '02', title: 'AI Generates Roadmap', desc: 'IBM Granite creates your personalized week-by-week learning roadmap instantly.' },
  { step: '03', title: 'Learn & Track Progress', desc: 'Follow your roadmap, complete topics, take assessments, and log your progress.' },
  { step: '04', title: 'AI Adapts Continuously', desc: 'LearnMate analyzes your progress and continuously adapts recommendations.' },
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LearnMate</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#features" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#domains" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">Domains</a>
              <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">Log In</Link>
              <Link to="/register" className="btn-primary text-sm px-5 py-2">Get Started</Link>
            </div>
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </button>
          </div>
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
              <a href="#how-it-works" className="block text-sm text-gray-600 py-1">How It Works</a>
              <a href="#features" className="block text-sm text-gray-600 py-1">Features</a>
              <a href="#domains" className="block text-sm text-gray-600 py-1">Domains</a>
              <Link to="/login" className="block text-sm text-gray-600 py-1">Log In</Link>
              <Link to="/register" className="btn-primary text-sm inline-block px-5 py-2">Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-medium px-4 py-2 rounded-full mb-8">
            <Zap className="h-3 w-3" />
            Powered by IBM Granite AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your AI-Powered<br />
            <span className="text-yellow-300">Personalized Learning Coach</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing what to learn. LearnMate uses IBM Granite AI to create a custom roadmap based on your goals, assess your skills, and adapt your path in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-lg hover:bg-primary-50 transition-all shadow-lg">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 border border-white/40 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition-all">
              Explore LearnMate <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[['10+', 'Learning Domains'], ['IBM Granite', 'AI Powered'], ['Adaptive', 'Roadmaps']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs text-primary-200 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge bg-red-100 text-red-700 mb-4 inline-block">The Problem</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Too Many Courses, No Clear Path
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Students spend hours browsing hundreds of online courses without knowing which ones match their goals or skill level. Without personalized guidance, learners feel overwhelmed, lose motivation, and waste precious time going in the wrong direction.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: '😓', title: 'Information Overload', desc: 'Thousands of courses with no personalized guidance' },
              { emoji: '🎯', title: 'Wrong Learning Path', desc: 'Learning topics in the wrong order wastes months' },
              { emoji: '📉', title: 'Lack of Progress Tracking', desc: 'No way to measure improvement or stay motivated' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="badge bg-primary-100 text-primary-700 mb-3 inline-block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">From Zero to Roadmap in Minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Personalization */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge bg-primary-100 text-primary-700 mb-4 inline-block">AI Personalization</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                IBM Granite Makes It Personal
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                LearnMate uses IBM Granite through watsonx.ai to deeply understand your learning profile and generate tailored roadmaps that evolve with you. No two learning paths are the same.
              </p>
              <ul className="space-y-3">
                {[
                  'Personalized roadmaps based on your goals',
                  'Skill assessments with AI-generated questions',
                  'Continuous roadmap adaptation based on progress',
                  'AI chat coach for instant learning support',
                  'Smart resource recommendations',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card border-2 border-primary-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-sm">IBM Granite AI</span>
                <span className="ml-auto badge bg-green-100 text-green-700">Active</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-700">
                <div className="text-green-600 mb-2">→ Analyzing your profile...</div>
                <div className="text-gray-500 mb-1">Skills: JavaScript, HTML, CSS</div>
                <div className="text-gray-500 mb-1">Goal: Frontend Internship</div>
                <div className="text-gray-500 mb-2">Level: Intermediate</div>
                <div className="text-primary-600 font-semibold">✓ Generating 12-week roadmap</div>
                <div className="text-primary-500 text-xs mt-1">React → State Management → Testing → Projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="badge bg-primary-100 text-primary-700 mb-3 inline-block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need to Succeed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                  <Icon className="h-5 w-5 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section id="domains" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge bg-secondary-100 text-secondary-600 mb-3 inline-block">Learning Domains</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Learn What Matters to You</h2>
          <p className="text-gray-500 mb-10">LearnMate covers all major tech domains with personalized paths for each</p>
          <div className="flex flex-wrap justify-center gap-3">
            {domains.map((d) => (
              <span key={d} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 cursor-default transition-colors shadow-sm">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start Your AI-Powered Learning Journey Today</h2>
          <p className="text-primary-200 mb-8 text-lg">Join LearnMate and let IBM Granite AI build your perfect learning path.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-10 py-4 rounded-lg hover:bg-primary-50 transition-all shadow-lg text-lg">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-semibold">LearnMate</span>
            </div>
            <p className="text-sm">Powered by IBM Granite · watsonx.ai · MERN Stack</p>
            <div className="flex gap-4 text-sm">
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
