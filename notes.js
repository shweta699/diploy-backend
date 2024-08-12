const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/Note');
const SharedAccess = require('../models/SharedAccess');
const User = require('../models/User');

const router = express.Router();

// Middleware to check authentication
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// Create a new note
router.post('/', authMiddleware, async (req, res) => {
    try {
        const note = await Note.create({ content: req.body.content, creatorId: req.user.id });
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Could not create note' });
    }
});

// Edit an existing note
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findByPk(req.params.id);
        if (note.creatorId !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        note.content = req.body.content;
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Could not update note' });
    }
});

// View all notes by the user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.findAll({ where: { creatorId: req.user.id } });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch notes' });
    }
});

// Share a note
router.post('/share', authMiddleware, async (req, res) => {
    const { noteId, userEmail, permission } = req.body;

    try {
        const note = await Note.findByPk(noteId);
        const user = await User.findOne({ where: { email: userEmail } });

        if (!note || !user) return res.status(404).json({ error: 'Note or user not found' });

        if (note.creatorId !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await SharedAccess.create({ noteId, userId: user.id, permission });
        res.json({ msg: 'Note shared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Could not share note' });
    }
});

module.exports = router;
