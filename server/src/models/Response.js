const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['attending', 'absent', 'pending'], default: 'pending' },
  reason: { type: String, default: null }
}, { timestamps: true });

// Índice compuesto único para evitar respuestas duplicadas por usuario y evento
responseSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);