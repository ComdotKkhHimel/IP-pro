const mongoose = require('mongoose');

const CheckHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uid: { type: String, required: true },
  status: { type: String, enum: ['active', 'suspended', 'invalid'] },
  checkedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CheckHistory', CheckHistorySchema);

