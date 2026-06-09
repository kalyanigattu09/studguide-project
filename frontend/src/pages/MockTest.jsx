import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  ClipboardList, Clock, Award, CheckCircle2, AlertTriangle, BookOpen,
  ArrowRight, ShieldCheck, HelpCircle, Loader2, PlayCircle, BarChart2, Star
} from 'lucide-react';

export default function MockTest() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active quiz state
  const [activeTest, setActiveTest] = useState(null); // Full test with questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { 0: 2, 1: 3 }
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Post-quiz scorecards
  const [scorecard, setScorecard] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  // Timer loop
  useEffect(() => {
    if (!activeTest || scorecard) return;

    if (timeRemaining <= 0) {
      handleQuizSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(t => t - 1);
      setTimeSpent(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, timeRemaining, scorecard]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/mocktest');
      if (data.success) setTests(data.data);
    } catch (err) {
      console.warn("Failed fetching mock tests list.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/api/mocktest/${testId}`);
      if (data.success) {
        setActiveTest(data.data);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setTimeRemaining(data.data.durationMinutes * 60);
        setTimeSpent(0);
        setScorecard(null);
      }
    } catch {
      alert("Failed loading mock test questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optIndex });
  };

  const handleQuizSubmit = async () => {
    if (!activeTest) return;
    try {
      setLoading(true);
      
      // Adapt answers object into index array: [0, null, 2]
      const answersArray = activeTest.questions.map((_, idx) => 
        answers[idx] !== undefined ? answers[idx] : null
      );

      const { data } = await apiClient.post(`/api/mocktest/${activeTest._id}/submit`, {
        answers: answersArray,
        timeSpentSeconds: timeSpent
      });

      if (data.success) {
        setScorecard(data.data);
      }
    } catch {
      alert("Failed submitting mock test responses.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading && !activeTest) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 skeleton" />
          <div className="h-44 skeleton" />
          <div className="h-44 skeleton" />
        </div>
      </div>
    );
  }

  // timed Quiz taker Environment
  if (activeTest && !scorecard) {
    const q = activeTest.questions[currentQuestionIndex];
    const totalQ = activeTest.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQ) * 100;
    const selectedOption = answers[currentQuestionIndex];

    return (
      <div className="min-h-[80vh] flex flex-col justify-between max-w-3xl mx-auto card glass p-8 animate-fade-in relative">
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white leading-snug">{activeTest.title}</h2>
            <span className="badge badge-indigo text-xxs mt-1" style={{ fontSize: '9px' }}>Question {currentQuestionIndex + 1} of {totalQ}</span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 font-mono text-sm px-3.5 py-1.5 rounded-xl border" style={{ color: timeRemaining < 60 ? '#f43f5e' : '#818cf8', borderColor: timeRemaining < 60 ? '#f43f5e40' : '#818cf840', background: timeRemaining < 60 ? '#f43f5e10' : '#818cf810' }}>
            <Clock size={16} className={timeRemaining < 60 ? 'animate-pulse' : ''} />
            <span className="font-extrabold text-base">{formatTimer(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress meter */}
        <div className="mb-6">
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        {/* Question Panel */}
        <div className="flex-1 space-y-6">
          <h3 className="text-lg font-bold text-white leading-relaxed">{q.questionText}</h3>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <motion.div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="glass rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all border"
                  style={{
                    borderColor: isSelected ? 'var(--accent-indigo)' : 'var(--border)',
                    background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--surface)'
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: isSelected ? 'var(--accent-indigo)' : 'var(--surface-high)', color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: isSelected ? '#818cf8' : 'var(--text-primary)' }}>{opt}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Nav Buttons */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
          <button
            className="btn btn-secondary py-2"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(i => i - 1)}
          >
            Previous
          </button>
          
          {currentQuestionIndex + 1 < totalQ ? (
            <button
              className="btn btn-primary py-2"
              onClick={() => setCurrentQuestionIndex(i => i + 1)}
            >
              Next Question
            </button>
          ) : (
            <button
              className="btn btn-primary py-2 glow-indigo"
              style={{ background: 'var(--grad-hero)' }}
              onClick={handleQuizSubmit}
            >
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    );
  }

  // post-Quiz Diagnostic Scorecard
  if (scorecard) {
    const accuracy = scorecard.scorePercent;
    
    return (
      <div className="max-w-2xl mx-auto card glass p-8 animate-fade-in text-center space-y-6">
        <h2 className="text-2xl font-extrabold text-white">Diagnostic Scorecard Finished!</h2>
        
        {/* Score circular visual */}
        <div className="w-32 h-32 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center mx-auto bg-indigo-500/5 shadow-glow relative">
          <span className="text-4xl font-black text-white">{accuracy}%</span>
          <span className="text-xxs text-muted uppercase tracking-wider mt-0.5" style={{ fontSize: '8px' }}>Accuracy</span>
        </div>

        {/* Score details */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-4 border-y border-white/5">
          <div>
            <div className="text-xs text-muted">Marks Scored</div>
            <div className="font-bold text-lg text-white mt-0.5">{scorecard.marksObtained} / {scorecard.totalMarks}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Time Spent</div>
            <div className="font-bold text-lg text-white mt-0.5">{Math.floor(scorecard.timeSpentSeconds / 60)}m {scorecard.timeSpentSeconds % 60}s</div>
          </div>
          <div>
            <div className="text-xs text-muted">Category</div>
            <div className="font-bold text-lg text-indigo-400 mt-0.5">{scorecard.category}</div>
          </div>
        </div>

        {/* Weak topic warning system */}
        {scorecard.weakTopics?.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-left max-w-md mx-auto space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Weak Topic Detected!
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              Our placement engines detected a lower comprehension in: <span className="font-semibold text-rose-300">{scorecard.weakTopics.join(', ')}</span>. 
              We recommend visiting the Study Planner to add reinforcement tasks.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-4">
          <button className="btn btn-secondary py-2" onClick={() => { setActiveTest(null); setScorecard(null); fetchTests(); }}>
            Back to Dashboard
          </button>
          <button className="btn btn-primary py-2" onClick={() => handleStartTest(activeTest._id)}>
            Try Assessment Again
          </button>
        </div>
      </div>
    );
  }

  // RENDER SELECTION GRID
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Placement <span className="gradient-text">Mock Tests</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Test your conceptual capabilities under simulated constraints and receive immediate weak topic diagnostics.
        </p>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <motion.div
            key={test._id}
            className="card glass relative flex flex-col justify-between"
            whileHover={{ y: -4 }}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="badge badge-indigo">{test.category}</span>
                <Clock size={16} className="text-muted" />
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">{test.title}</h3>
              <p className="text-xs text-muted mt-2">
                This diagnostic test contains high-fidelity multiple choice questions assessing standard core concepts.
              </p>

              {/* Specs */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs text-secondary">
                <div>Duration: <span className="text-white font-bold">{test.durationMinutes} Mins</span></div>
                <div>Total Marks: <span className="text-white font-bold">{test.totalMarks} Marks</span></div>
              </div>
            </div>

            <button
              className="btn btn-primary w-full justify-center mt-6 py-2"
              onClick={() => handleStartTest(test._id)}
            >
              <PlayCircle size={16} /> Start Mock Assessment
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
