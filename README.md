# Final Project by Folios

## Overview
This is a backend implementation of a social media platform built as a final project for Web Application Development course. The application provides features for user authentication, posting, stories, comments, and social interactions using Node.js, Express, and MongoDB.

## Features
- User registration and authentication (using Passport.js)
- User profiles and management
- Posting system with image uploads
- Stories feature
- Comments on posts
- Social interactions (likes, follows, etc.)
- File upload handling with Multer
- Session-based authentication

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with Local Strategy
- **File Uploads**: Multer
- **Session Management**: Express-Session
- **Password Hashing**: bcryptjs

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd final-project-by-folios
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up MongoDB:
   - Ensure MongoDB is installed and running on your system
   - Update the database connection in `db.js` if needed

4. Start the server:
   ```
   npm start
   ```
   Or for development with auto-restart:
   ```
   npx nodemon server.js
   ```

The server will run on `http://localhost:3000`

## API Endpoints
- `/api/auth` - Authentication routes (login, register, logout)
- `/api/user` - User management (protected)
- `/api/posts` - Post operations (protected)
- `/api/social` - Social interactions (protected)
- `/api/stories` - Stories management (protected)

## Project Structure
- `server.js` - Main application entry point
- `db.js` - Database connection
- `models/` - Mongoose models (User, Post, Story, Comment)
- `routes/` - API route handlers
- `middleware/` - Custom middleware (authentication, file upload)
- `config/` - Configuration files (Passport setup)
- `uploads/` - Static file uploads directory
- `Documentation/` - Project design documents
- `classDiagram/` - UML class diagrams

## Future Plans
- Implement a realtime chat bot feature for user interactions
- Develop a frontend interface (React/Vue/Angular) to complement the backend API
- Add real-time notifications using WebSockets
- Enhance security features and API documentation

## Contributing
This is a university final project. For contributions or improvements, please refer to the project documentation in the `Documentation/` folder.

## License
ISC