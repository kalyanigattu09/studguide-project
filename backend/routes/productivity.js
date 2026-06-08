// STUGUIDE X - Productivity Routes
const express = require('express');
const { 
  getTasks, createTask, updateTaskStatus,
  getHabits, createHabit, completeHabitToday,
  createReminder, getNotifications, markReadNotification
} = require('../controllers/productivityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markReadNotification);

router.route('/tasks')
  .get(protect, getTasks)
  .post(protect, createTask);

router.put('/tasks/:id/status', protect, updateTaskStatus);

router.route('/habits')
  .get(protect, getHabits)
  .post(protect, createHabit);

router.put('/habits/:id/complete', protect, completeHabitToday);

router.post('/reminder', protect, createReminder);

module.exports = router;
