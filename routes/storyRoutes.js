const express = require('express');
const router = express.Router();
const Story = require('../models/story');
const User = require('../models/user');
const upload = require('../middleware/upload'); 

// 1. UPLOAD STORY
// URL: /api/stories/upload
router.post('/upload',   upload.single('image'), async (req, res) => {
    try {
        // Agar photo nahi bheji to error do
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required for story' });
        }

        // Database mein story save karo
        const newStory = new Story({
            image: req.file.path,
            author: req.user._id
        });

        await newStory.save();

        res.status(201).json({ 
            message: "Story uploaded successfully! (Will disappear in 24h)", 
            story: newStory 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET STORIES FEED (Followed Users Only)
// URL: /api/stories/feed
router.get('/feed',   async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        // Logic: Sirf unki stories lao jinhein maine follow kiya hua hai + Meri apni story
        const stories = await Story.find({
            author: { $in: [...currentUser.following, req.user._id] }
        })
        .populate('author', 'username profilePic')
        .sort({ createdAt: -1 }); 

        res.json(stories);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;