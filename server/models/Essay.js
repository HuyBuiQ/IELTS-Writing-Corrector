const mongoose = require('mongoose');

const EssaySchema = new mongoose.Schema({
  topic: { type: String, required: true },
  essay: { type: String, required: true }, 
  result: {
    bandScore: Number,
    feedback: String,
    correctedEssay: String,
    criteria: {
      TR: Number,
      CC: Number,
      LR: Number,
      GRA: Number
    }
    
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Essay', EssaySchema);