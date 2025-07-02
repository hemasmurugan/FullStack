const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  date: {
    type: String,
    required: function() {
      return this.type !== 'daily';
    }
  },
  priority: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  startTime: { type: String },
  endTime: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema); 