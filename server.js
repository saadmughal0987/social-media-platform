const express = require("express");
const app = express();
const db = require("./db"); 
// const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const path = require("path"); 
const storyRoutes = require("./routes/storyRoutes");

// Routes Import
const User = require("./models/user");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); 
const socialRoutes = require("./routes/socialRoutes");
const isLoggedIn = require('./middleware/isLoggedIn');

require('./config/passport')(passport);

// 1. MIDDLEWARE (New Style)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 2. STATIC FOLDER (IMAGES DIKHANE KE LIYE) 
app.use('/uploads', express.static('uploads'));

// 3. SESSION & PASSPORT
app.use(session({
    secret: 'social_connect_secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); 

// 4. ROUTES
app.use("/api/auth", authRoutes); 
app.use("/api/user",isLoggedIn, userRoutes); 
app.use("/api/posts",isLoggedIn, postRoutes);
app.use("/api/social",isLoggedIn, socialRoutes);
app.use("/api/stories",isLoggedIn, storyRoutes);

const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port 3000");
});