import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../utils/apiClient';
import {
  Calendar as CalIcon, Clock, Plus, Trash2, CheckCircle2, Circle, AlertCircle,
  PlayCircle, RefreshCw, Layers, CheckCircle, Loader2
} from 'lucide-react';

export default function Planner() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskBlock, setTaskBlock] = useState('Morning'); // Morning, Afternoon, Evening, Night
  const [taskType, setTaskType] = useState('Study'); // Study, Mock, Code, Revision

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/api/productivity/tasks?date=${selectedDate}`);
      if (data.success) setTasks(data.data);
    } catch (err) {
      console.warn("Failed fetching planner tasks.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      const { data } = await apiClient.post('/api/productivity/tasks', {
        title: taskTitle.trim(),
        type: taskType,
        date: selectedDate,
        timeBlock: taskBlock
      });
      if (data.success) {
        setTaskTitle('');
        fetchTasks();
      }
    } catch {
      alert("Failed creating study task.");
    }
  };

  const handleUpdateStatus = async (taskId, currentStatus) => {
    const nextStatusMap = {
      'Todo': 'InProgress',
      'InProgress': 'Done',
      'Done': 'Todo'
    };
    const newStatus = nextStatusMap[currentStatus];
    try {
      const { data } = await apiClient.put(`/api/productivity/tasks/${taskId}/status`, { status: newStatus });
      if (data.success) {
        fetchTasks();
      }
    } catch {
      alert("Failed updating task progress.");
    }
  };

  const blocks = ['Morning', 'Afternoon', 'Evening', 'Night'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Smart Study <span className="gradient-text">Planner</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Time-block your daily schedule, track mock preparations, and trigger automatic background queue reminders.
          </p>
        </div>

        {/* Date Selector */}
        <div className="relative flex items-center gap-2 font-mono text-sm px-3.5 py-1.5 rounded-xl border glass" style={{ borderColor: 'var(--border)' }}>
          <CalIcon size={16} className="text-indigo-400" />
          <input
            type="date"
            className="bg-transparent text-white outline-none border-0 font-bold"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Schedule Boards */}
        <div className="lg:col-span-2 space-y-6">
          
          {loading ? (
            <div className="h-60 flex flex-col items-center justify-center gap-3 card glass">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
              <p className="text-sm text-muted">Synchronizing study blocks...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map(block => {
                const blockTasks = tasks.filter(t => t.timeBlock === block);
                
                return (
                  <div key={block} className="card glass p-5 flex flex-col md:flex-row gap-4 justify-between items-start border-l-4"
                    style={{ borderLeftColor: block === 'Morning' ? '#6366f1' : block === 'Afternoon' ? '#06b6d4' : block === 'Evening' ? '#8b5cf6' : '#f59e0b' }}
                  >
                    {/* Time Header */}
                    <div className="md:w-32 flex-shrink-0">
                      <h3 className="font-bold text-white text-base leading-snug">{block} Block</h3>
                      <span className="text-xxs text-muted mt-0.5 uppercase tracking-wider" style={{ fontSize: '9px' }}>
                        {block === 'Morning' ? '08:00 - 12:00' : block === 'Afternoon' ? '12:00 - 17:00' : block === 'Evening' ? '17:00 - 21:00' : '21:00 - Midnight'}
                      </span>
                    </div>

                    {/* Tasks list inside block */}
                    <div className="flex-grow space-y-2 w-full">
                      {blockTasks.length === 0 ? (
                        <div className="text-xs text-muted py-2 italic">No tasks scheduled for this period.</div>
                      ) : (
                        blockTasks.map(task => (
                          <motion.div
                            key={task._id}
                            className="glass rounded-xl p-3 flex justify-between items-center transition-all hover:bg-white/5 border border-white/5 cursor-pointer"
                            onClick={() => handleUpdateStatus(task._id, task.status)}
                            whileHover={{ x: 2 }}
                          >
                            <div className="flex items-center gap-3">
                              {task.status === 'Done' ? (
                                <CheckCircle size={16} className="text-emerald-400" />
                              ) : task.status === 'InProgress' ? (
                                <RefreshCw size={16} className="text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                              ) : (
                                <Circle size={16} className="text-muted" />
                              )}
                              
                              <span className={`text-sm font-semibold transition-all ${task.status === 'Done' ? 'line-through text-muted' : 'text-white'}`}>
                                {task.title}
                              </span>
                            </div>
                            
                            <div>
                              <span className="badge badge-cyan" style={{ fontSize: '8px', padding: '2px 6px' }}>{task.type}</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Task scheduler Form */}
        <div className="space-y-6">
          <div className="card glass">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" /> Add Study Task
            </h2>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="label">Task Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="LeetCode 3 DSA Challenges"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Study Time Block</label>
                <select className="input" value={taskBlock} onChange={e => setTaskBlock(e.target.value)}>
                  {blocks.map(b => <option key={b} value={b}>{b} Block</option>)}
                </select>
              </div>

              <div>
                <label className="label">Assessment Type</label>
                <select className="input" value={taskType} onChange={e => setTaskType(e.target.value)}>
                  <option value="Study">Theory & Lectures</option>
                  <option value="Mock">Mock Test Prep</option>
                  <option value="Code">LeetCode Coding</option>
                  <option value="Revision">Formula Revision</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center py-2.5">
                <Plus size={16} /> Schedule Task Block
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
