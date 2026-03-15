const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

router.use(auth);

router.post('/summarize/:noteId', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    const summary = await aiService.summarize(note.content);
    note.summary = summary;
    await note.save();

    res.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error.message);
    res.status(500).json({ message: 'Failed to generate summary. Check your Gemini API key.' });
  }
});

router.post('/flashcards/:noteId', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    const flashcards = await aiService.generateFlashcards(note.content);
    note.flashcards = flashcards;
    await note.save();

    res.json({ flashcards });
  } catch (error) {
    console.error('Flashcards error:', error.message);
    res.status(500).json({ message: 'Failed to generate flashcards. Check your Gemini API key.' });
  }
});

router.post('/ask/:noteId', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required.' });
    }

    const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    const answer = await aiService.askQuestion(note.content, question);
    res.json({ answer });
  } catch (error) {
    console.error('Ask error:', error.message);
    res.status(500).json({ message: 'Failed to get answer. Check your Gemini API key.' });
  }
});

router.post('/quiz/:noteId', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    const quiz = await aiService.generateQuiz(note.content);
    res.json({ quiz });
  } catch (error) {
    console.error('Quiz error:', error.message);
    res.status(500).json({ message: 'Failed to generate quiz. Check your Gemini API key.' });
  }
});

module.exports = router;
