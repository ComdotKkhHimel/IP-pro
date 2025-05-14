const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  apiKey: { type: String },
  checksRemaining: { type: Number, default: 10 },
  subscription: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' }
});

module.exports = mongoose.model('User', UserSchema);

