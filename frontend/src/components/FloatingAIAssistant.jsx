import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Zap, BookOpen, Briefcase, Target } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Career Path?', icon: Target, prompt: 'What career path suits me as a CSE student?' },
  { label: 'Resume Tips', icon: BookOpen, prompt: 'How can I improve my resume ATS score?' },
  { label: 'Mock Test Tips', icon: Zap, prompt: 'Tips for cracking aptitude mock tests fast?' },
  { label: 'Placement Advice', icon: Briefcase, prompt: 'What should I focus on before placement season?' },
];

const AI_RESPONSES = {
  'career': `🎯 **Career Guidance:**\nBased on a CSE profile, the top career paths are:\n\n• **Full Stack Developer** – High demand, great packages (₹15–35 LPA)\n• **AI/ML Engineer** – Fastest growing field with Python + TensorFlow\n• **DevOps Engineer** – Cloud-native companies love this profile\n\nI recommend starting with your **Placement Readiness Score** on the dashboard to identify your gaps!`,
  'resume': `📄 **Resume Tips:**\n\n• Use **action verbs** (Built, Designed, Optimized)\n• Add **quantifiable metrics** (Improved performance by 40%)\n• List **top 8–10 skills** matching the job description\n• Include **GitHub links** for all projects\n• Use the **Resume Analyzer** tool to get your ATS score!\n\nAvoid tables and columns — they confuse most ATS parsers.`,
  'mock': `⚡ **Mock Test Strategy:**\n\n• Spend the first **30 seconds** scanning all questions\n• Skip and revisit tough questions — don't get stuck\n• For aptitude: learn **shortcuts for percentage, profit/loss, and time-work**\n• Practice **30 min timed sessions** every day on the Mock Test Platform\n• Check your **Weak Topics** in the analytics after each test!`,
  'placement': `💼 **Placement Season Checklist:**\n\n✅ CGPA > 7.5 if possible\n✅ 2–3 strong, live projects on GitHub\n✅ Resume ATS Score > 70%\n✅ Complete DSA Sheet (Striver's recommended)\n✅ Practice **HR + Technical questions** in the Interview Hub\n✅ Maintain **coding streak** for consistency signals`,
};

const getAIResponse = (prompt) => {
  const lower = prompt.toLowerCase();
  if (lower.includes('career') || lower.includes('path') || lower.includes('cse')) return AI_RESPONSES['career'];
  if (lower.includes('resume') || lower.includes('ats')) return AI_RESPONSES['resume'];
  if (lower.includes('mock') || lower.includes('aptitude') || lower.includes('test')) return AI_RESPONSES['mock'];
  if (lower.includes('placement') || lower.includes('interview') || lower.includes('focus')) return AI_RESPONSES['placement'];
  return `🤖 **STUGUIDE AI:** I understand you're asking about "${prompt}". While my knowledge base is still growing, I recommend:\n\n• Checking your **Dashboard** for personalized recommendations\n• Using the **Career Guidance** module for curated roadmaps\n• Posting in the **Community Forum** for peer advice\n\nIs there something more specific I can help you with?`;
};

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: '👋 Hi! I\'m your STUGUIDE AI Assistant.\n\nI can help you with career guidance, resume tips, placement strategy, and more. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(userText);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-xl"
        style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[360px] glass-high rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)', maxHeight: '520px' }}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            {/* Header */}
            <div className="gradient-bg px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">STUGUIDE AI</div>
                <div className="text-white/70 text-xs">Your Personal Career Assistant</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-xs">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: '300px' }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="max-w-[85%] px-3 py-2.5 rounded-xl text-sm whitespace-pre-wrap leading-relaxed"
                    style={{
                      background: msg.role === 'user' ? 'var(--accent-indigo)' : 'var(--surface-high)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass px-4 py-3 rounded-2xl" style={{ borderRadius: '16px 16px 16px 4px' }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'var(--accent-indigo)' }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar">
              {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                <motion.button
                  key={label}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(prompt)}
                >
                  <Icon size={12} />
                  {label}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="input text-sm py-2"
                style={{ flex: 1 }}
              />
              <motion.button
                className="btn btn-primary px-3 py-2"
                onClick={() => sendMessage()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={15} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
