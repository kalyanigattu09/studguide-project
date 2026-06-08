// STUGUIDE X - Productivity Controller (Planner, Habits, Streaks, Reminders & Queue Processing)
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const Profile = require('../models/Profile');
const hybridDb = require('../config/hybridDb');
const { dispatchQueue } = require('../services/queue');

// Helper to update student coding streak in profile
const updateProfileStreak = async (studentId, streak) => {
  if (hybridDb.isActive) {
    const profile = hybridDb.findOne('profiles', { user: studentId });
    if (profile) {
      hybridDb.update('profiles', { user: studentId }, { codingStreak: streak });
    }
  } else {
    const profile = await Profile.findOne({ user: studentId });
    if (profile) {
      profile.codingStreak = streak;
      await profile.save();
    }
  }
};

// ==========================================
// 1. SMART STUDY PLANNER (TASKS)
// ==========================================

exports.getTasks = async (req, res, next) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    let tasks;
    if (hybridDb.isActive) {
      tasks = hybridDb.find('tasks', { student: req.user._id, date });
    } else {
      tasks = await Task.find({ student: req.user._id, date });
    }
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, type, date, timeBlock } = req.body;
    const taskPayload = {
      student: req.user._id,
      title,
      type: type || 'Daily',
      date,
      timeBlock: timeBlock || 'General',
      status: 'Todo'
    };

    let task;
    if (hybridDb.isActive) {
      task = hybridDb.insert('tasks', taskPayload);
    } else {
      task = await Task.create(taskPayload);
    }

    // Queue a background notification event when task is scheduled
    dispatchQueue.enqueue({
      userId: req.user._id,
      title: 'Task Created',
      message: `New task: "${title}" added to your study planner.`
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Todo, InProgress, Done

    let task;
    if (hybridDb.isActive) {
      task = hybridDb.findOne('tasks', { _id: id });
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      hybridDb.update('tasks', { _id: id }, { status });
      task = hybridDb.findOne('tasks', { _id: id });
    } else {
      task = await Task.findById(id);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      task.status = status;
      await task.save();
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. HABIT TRACKER (STREAKS)
// ==========================================

exports.getHabits = async (req, res, next) => {
  try {
    let habits;
    if (hybridDb.isActive) {
      habits = hybridDb.find('habits', { student: req.user._id });
    } else {
      habits = await Habit.find({ student: req.user._id });
    }
    res.status(200).json({ success: true, count: habits.length, data: habits });
  } catch (err) {
    next(err);
  }
};

exports.createHabit = async (req, res, next) => {
  try {
    const { name } = req.body;
    const habitPayload = {
      student: req.user._id,
      name,
      streakCount: 0,
      history: []
    };

    let habit;
    if (hybridDb.isActive) {
      habit = hybridDb.insert('habits', habitPayload);
    } else {
      habit = await Habit.create(habitPayload);
    }

    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    next(err);
  }
};

exports.completeHabitToday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let habit;
    if (hybridDb.isActive) {
      habit = hybridDb.findOne('habits', { _id: id });
      if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });

      const history = habit.history || [];
      if (history.includes(todayStr)) {
        return res.status(400).json({ success: false, error: 'Habit already completed today' });
      }

      const updatedHistory = [...history, todayStr];
      let newStreak = habit.streakCount + 1;

      // Check if streak was broken (last completed was not yesterday)
      if (habit.lastCompleted) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // If last completed date isn't yesterday and isn't today, reset streak to 1
        const lastCompletedStr = new Date(habit.lastCompleted).toISOString().split('T')[0];
        if (lastCompletedStr !== yesterdayStr && lastCompletedStr !== todayStr) {
          newStreak = 1;
        }
      }

      hybridDb.update('habits', { _id: id }, {
        history: updatedHistory,
        streakCount: newStreak,
        lastCompleted: new Date()
      });
      
      habit = hybridDb.findOne('habits', { _id: id });
      
      // Update global coding streak in profile if this is the "Coding" habit
      if (habit.name.toLowerCase().includes('coding')) {
        await updateProfileStreak(req.user._id, newStreak);
      }
    } else {
      habit = await Habit.findById(id);
      if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });

      if (habit.history.includes(todayStr)) {
        return res.status(400).json({ success: false, error: 'Habit already completed today' });
      }

      habit.history.push(todayStr);
      let newStreak = habit.streakCount + 1;

      if (habit.lastCompleted) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const lastCompletedStr = habit.lastCompleted.toISOString().split('T')[0];
        
        if (lastCompletedStr !== yesterdayStr && lastCompletedStr !== todayStr) {
          newStreak = 1;
        }
      }

      habit.streakCount = newStreak;
      habit.lastCompleted = Date.now();
      await habit.save();

      if (habit.name.toLowerCase().includes('coding')) {
        await updateProfileStreak(req.user._id, newStreak);
      }
    }

    res.status(200).json({ success: true, data: habit });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. REMINDERS & NOTIFICATION BULLETINS
// ==========================================

exports.createReminder = async (req, res, next) => {
  try {
    const { title, type, datetime } = req.body;
    const reminderPayload = {
      user: req.user._id,
      title,
      type,
      datetime: new Date(datetime),
      status: 'Pending'
    };

    let reminder;
    if (hybridDb.isActive) {
      reminder = hybridDb.insert('reminders', reminderPayload);
    } else {
      reminder = await Reminder.create(reminderPayload);
    }

    // Insert notification to DB
    const notifPayload = {
      user: req.user._id,
      title: `Reminder Scheduled: ${title}`,
      message: `You will be notified on ${new Date(datetime).toLocaleString()}`,
      type: 'Alert'
    };

    let notif;
    if (hybridDb.isActive) {
      notif = hybridDb.insert('notifications', notifPayload);
    } else {
      notif = await Notification.create(notifPayload);
    }

    // Push notification event to Queue
    dispatchQueue.enqueue({
      userId: req.user._id,
      title: notifPayload.title,
      message: notifPayload.message
    });

    res.status(201).json({ success: true, data: { reminder, notif } });
  } catch (err) {
    next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    let notifs;
    if (hybridDb.isActive) {
      notifs = hybridDb.find('notifications', { user: req.user._id });
    } else {
      notifs = await Notification.find({ user: req.user._id }).sort('-createdAt');
    }
    res.status(200).json({ success: true, count: notifs.length, data: notifs });
  } catch (err) {
    next(err);
  }
};

exports.markReadNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (hybridDb.isActive) {
      hybridDb.update('notifications', { _id: id }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
