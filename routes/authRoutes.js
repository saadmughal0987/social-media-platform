const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs'); 
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

        req.logIn(user, (err) => {
            if (err) return next(err);
            
            return res.json({ 
                message: "Login Successful",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName
                }
            });
        });
    })(req, res, next);
});

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Logout error" });
            }

            res.clearCookie('connect.sid');
            
            res.json({ message: "Logged out successfully" });
        });
    });
});
module.exports = router;