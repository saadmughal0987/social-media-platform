const express = require('express');
const router = express.Router();
const User = require('../models/user');
const upload = require('../middleware/upload');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // Password hash karne ke liye

// 1. Get User Profile (Profile dekhna)
// URL: /api/user/profile/laheem_king
router.get('/profile/:username',    async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Search Users (🔍 NAYA)
// URL: /api/user/search?q=ali
router.get('/search' , async (req, res) => {
    try {
        const query = req.query.q; // URL se 'q' ki value uthao
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Database mein dhoondo (Regex ka matlab: milta-julta naam dhoondo)
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        }).select('username fullName profilePic'); 

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// URL: /api/user/update
// routes/userRoutes.js

// ... (Update Route) ...
router.put('/update',    upload.single('profilePic'), async (req, res) => {
    try {
        // --- FIX IS HERE: (|| {}) Add kiya hai ---
        // Agar req.body undefined ho, to khali object use karo taake crash na ho
        const { bio, fullName, password } = req.body || {}; 
        
        const user = await User.findById(req.user._id);

        // 1. Text Update (Safe Check)
        if (bio) user.bio = bio;
        if (fullName) user.fullName = fullName;

        // 2. Password Update
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        // 3. Image Update
        if (req.file) {
            if (user.profilePic && user.profilePic !== "default.png") {
                const oldPath = user.profilePic;
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            user.profilePic = req.file.path;
        }

        await user.save(); 

        res.json({ 
            message: "Profile updated successfully", 
            user: {
                username: user.username,
                fullName: user.fullName,
                bio: user.bio,
                profilePic: user.profilePic
            }
        });

    } catch (err) {
        console.log(err); // Error ko console mein bhi print karwaya
        res.status(500).json({ error: err.message });
    }
});

// 4. Upload Profile Picture
// URL: /api/user/upload-avatar
router.put('/upload-avatar',    upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (user.profilePic && user.profilePic !== "default.png") {
            const oldPath = user.profilePic;
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        user.profilePic = req.file.path;
        await user.save();

        res.json({
            message: 'Profile picture updated successfully',
            profilePic: user.profilePic
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;