import express from "express";
import Idea from '../models/Idea';

import { ensureAuth } from '../utils/auth';

const router = express.Router();

// Protect the routes.
router.use(ensureAuth);

// Ideas
router.get('/', async (req, res) => {
    const ideas = await Idea.find({ user: req.user }).sort({ date: 'desc' });
    res.render('ideas/index', { ideas });
});

// Add Idea
router.get('/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea
router.get('/edit/:id', async (req, res) => {
    const idea = await Idea.findById(req.params.id);

    if (idea.user != req.user.id) {
        req.flash('error_msg', 'Not authorized');
        res.redirect('/ideas');
        return;
    }

    res.render('ideas/edit', { idea });
});

// Create an Idea
router.post('/', async (req, res) => {
    const errors = [];

    // Validate
    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add some details' });
    }
    if (errors.length) {
        res.render('ideas/add', {
            errors,
            title: req.body.title,
            details: req.body.details
        });
        return;
    }

    const idea = new Idea({
        title: req.body.title,
        details: req.body.details,
        user: req.user
    });

    try {
        await idea.save();

        req.flash('success_msg', 'Idea added!');
        res.redirect('/ideas');
    } catch (err) {
        res.send(err);
    }
});

// Edit an idea
router.put('/:id', async (req, res, next) => {
    const errors = [];

    // Validate
    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add some details' });
    }
    if (errors.length) {
        res.render('ideas/add', {
            errors,
            title: req.body.title,
            details: req.body.details
        });
        return;
    }

    try {
        await Idea.findOneAndUpdate({ _id: req.params.id, user: req.user }, { title: req.body.title, details: req.body.details });

        req.flash('success_msg', 'Idea updated!');
        res.redirect('/ideas');
    } catch (err) {
        next(err);
    }
});

// Delete an idea
router.delete('/:id', async (req, res, next) => {
    try {
        await Idea.findOneAndRemove({ _id: req.params.id, user: req.user });

        req.flash('success_msg', 'Idea removed!');
        res.redirect('/ideas');
    } catch (err) {
        next(err);
    }
});

export default router;