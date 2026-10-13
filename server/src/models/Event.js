const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, enum: ['training', 'match'], required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  deadline: { type: Date, required: true },
  rival: { type: String },
  status: { type: String, enum: ['published', 'closed'], default: 'published' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);