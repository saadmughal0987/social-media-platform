const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user'); 
const upload = require('../middleware/upload');
const fs = require('fs'); 

// 1. CREATE POST
// URL: /api/posts/create
router.post('/create',   upload.single('image'), async (req, res) => {  
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required!' });
        }

        const newPost = new Post({
            caption: req.body.caption,
            image: req.file.path,
            location: req.body.location,
            author: req.user._id 
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            message: 'Post created successfully!',
            post: savedPost
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET FEED (Sirf Followed Users ki Posts)
// URL: /api/posts/feed
router.get('/feed',   async (req, res) => {
    try {
        // Step 1: Login user ki details nikalo (taake 'following' list mil sake)
        const currentUser = await User.findById(req.user._id);

        // Step 2: Wo posts dhoondo jinke Author humari 'following' list mein hain
        const posts = await Post.find({ 
            author: { $in: currentUser.following } 
        })
        .sort({ createdAt: -1 }) // Newest post sabse upar 
        .populate('author', 'username profilePic') // Author ka naam aur pic sath jodo
        .populate({
            path: 'comments',
            populate: { path: 'author', select: 'username' } // Comments ke sath unke likhne walon ka naam bhi laye
        });

        res.json(posts);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET ALL POSTS (Explore Page)
// URL: /api/posts/all
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) 
            .populate('author', 'username profilePic'); 

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. GET USER'S POSTS (Profile Grid)
// URL: /api/posts/user/laheem_king
router.get('/user/:username', async (req, res) => {
    try {
        // Pehle Username se User ki ID dhoondo
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Phir us ID wali saari posts dhoondo
        const posts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate('author', 'username profilePic');

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE POST (Dynamic ID routes sabse end mein)
// URL: /api/posts/:postId
router.delete('/:postId',   async (req, res) => {
    try {
        // Post dhoondo
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // SECURITY CHECK: Kya ye post delete karne wala wahi banda hai jisne upload ki thi?
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized: You can only delete your own posts" });
        }

        // Server ke folder se image delete karo (Safai)
        if (fs.existsSync(post.image)) {
            fs.unlinkSync(post.image);
        }

        // Database se post uda do
        await post.deleteOne();

        res.json({ message: "Post deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. EDIT POST CAPTION
// URL: /api/posts/:postId
router.put('/:postId',   async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // SECURITY CHECK: Maalik check karo
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Sirf caption update karo
        post.caption = req.body.caption || post.caption;
        
        await post.save();

        res.json({ message: "Post updated", post });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;