const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');

// Middleware to check JWT
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
}

// Get today's tasks
router.get('/today', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const tasks = await Task.find({ userId: req.user.userId, date: today });
  res.json({ success: true, tasks });
});

// Add a task
router.post('/', auth, async (req, res) => {
  const { description, type, date, priority, order, startTime, endTime } = req.body;
  if (!description || !type || (type !== 'daily' && !date)) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  const taskData = {
    userId: req.user.userId,
    description,
    type,
    priority,
    order,
    startTime,
    endTime
  };
  if (type !== 'daily') {
    taskData.date = date;
  }
  const task = new Task(taskData);
  await task.save();
  res.json({ success: true, task });
});

// Mark task complete/incomplete
router.patch('/:id/complete', auth, async (req, res) => {
  const { completed } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { completed },
    { new: true }
  );
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
  res.json({ success: true, task });
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
  res.json({ success: true });
});

// Get all tasks for the authenticated user
router.get('/all', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
});

module.exports = router; 