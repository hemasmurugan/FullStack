const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT and set req.userId
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded._id || decoded.userId;
    if (!req.userId) throw new Error('No userId in token');
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token', error: err.message });
  }
}

// GET all study sessions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.userId });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create a new study session
router.post('/', auth, async (req, res) => {
  console.log('POST /api/study-sessions body:', req.body);
  try {
    const { subject, day, duration } = req.body;
    console.log('Parsed:', { subject, day, duration, userId: req.userId, types: { subject: typeof subject, day: typeof day, duration: typeof duration } });
    if (!subject || typeof day !== 'number' || isNaN(day) || day < 0 || day > 6 || !Number.isFinite(duration) || duration <= 0) {
      console.log('Validation failed:', { subject, day, duration });
      return res.status(400).json({ success: false, message: 'Missing or invalid required fields', body: req.body });
    }
    const session = new StudySession({
      user: req.userId,
      subject,
      day,
      duration,
      completed: false
    });
    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    console.error('Error in POST /api/study-sessions:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message, stack: err.stack });
  }
});

// PATCH mark complete/incomplete
router.patch('/:id', auth, async (req, res) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, user: req.userId });
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    if (typeof req.body.completed === 'boolean') session.completed = req.body.completed;
    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE a study session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 