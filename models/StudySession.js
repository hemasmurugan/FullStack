const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudySessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  day: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
  duration: { type: Number, required: true }, // in minutes
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudySession', StudySessionSchema); 