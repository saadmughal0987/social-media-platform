const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        const newUser = new User({
            username,
            email,
            password,
            fullName
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(400).json({ message: info.message });
        }

        const token = jwt.sign({ id: user._id }, 'social_connect_secret', { expiresIn: '1h' });

        return res.json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
    })(req, res, next);
});

router.post('/logout', (req, res) => {
    res.json({ message: "Logged out successfully" });
});
module.exports = router;