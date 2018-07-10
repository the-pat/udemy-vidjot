import bcrypt from 'bcryptjs';
import express from "express";
import passport from 'passport';

import User from '../models/User';

const router = express.Router();

// Login
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

// Register
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Log in a user
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Create a user
router.post('/register', async (req, res, next) => {
    const errors = [];

    // Validation
    if (!req.body.name) {
        errors.push('Your name is required');
    }
    if (!req.body.email) {
        errors.push('Your email is required');
    }
    if (req.body.password !== req.body.password2) {
        errors.push({text: 'Passwords do not match'});
    }
    if (req.body.password < 4) {
        errors.push({text: 'Password must be at least 4 characters'});
    }

    if (errors.length) {
        res.render('users/register', {
            errors,
            name: req.body.name,
            email: req.body.email
        });
        return;
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    try {
        const existingUser = await User.findOne({email: user.email});
        if (existingUser) {
            req.flash('error_msg', 'Email already registered');
            res.redirect('/users/register');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
    
        await user.save();
    
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/users/login');
    } catch (err) {
        next(err);
    }
});

export default router;