const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  question: String,
  answer: String
});

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  summary: {
    type: String,
    default: ''
  },
  flashcards: [flashcardSchema],
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

noteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
