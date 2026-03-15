const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('title content summary tags createdAt updatedAt');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({
      user: req.user._id,
      title,
      content,
      tags: tags || []
    });
    res.status(201).json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to create note.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, tags },
      { new: true, runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note.' });
  }
});

module.exports = router;
