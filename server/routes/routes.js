// Import required modules
const router = require('express').Router();
const bcrypt = require('bcryptjs'); // Library for hashing and comparing passwords
const jwt = require('jsonwebtoken'); // Library for generating and verifying JWTs
const User = require('../models/user.js'); // Import the User model to interact with MongoDB
require('dotenv').config(); // Load environment variables from .env file

// JWT secret keys from environment variables
const JWT_SECRET = process.env.JWT_SECRET; // Secret key for access tokens
const REFRESH_SECRET = process.env.REFRESH_SECRET; // Secret key for refresh tokens

// In-memory storage for refresh tokens (can be replaced by a database)
const refreshTokens = [];

// Function to generate an access token with a short expiration time (e.g., 15 minutes)
const generateAccessToken = (user) => {
    return jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '5s' });
};

// Function to generate a refresh token (typically longer-lived)
const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign({ _id: user._id }, REFRESH_SECRET);
    refreshTokens.push(refreshToken); // Store the refresh token in memory (can be stored in a database)
    return refreshToken;
};

// Route to register a new user
router.post('/register', async (req, res) => {
    // Generate a salt for hashing the password
    const salt = await bcrypt.genSalt(10);
    // Hash the user's password using the generated salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user instance with the hashed password
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        // Save the new user to the database
        const response = await newUser.save();
        // Exclude the password field from the response
        const { password, ...data } = await response.toJSON();
        // Send the user data as a response
        res.send(data);
    } catch (error) {
        // Return an error message if user registration fails
        res.status(400).send({ message: 'Error registering user', error });
    }
});

// Route to log in a user
router.post('/login', async (req, res) => {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    // If the user is not found, return a 404 error
    if (!user) {
        return res.status(404).send({ message: 'user not found' });
    }

    // Compare the provided password with the stored hashed password
    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({ message: 'invalid credentials' });
    }

    // Generate an access token and refresh token
    const accessToken = generateAccessToken(user); // Short-lived access token
    const refreshToken = generateRefreshToken(user); // Long-lived refresh token

    // Send the tokens in the response
    res.send({
        message: 'success',
        accessToken: accessToken,
        refreshToken: refreshToken
    });
});

// Route to refresh an access token using a refresh token
router.post('/token', (req, res) => {
    // Extract the refresh token from the request body
    const refreshToken = req.body.token;

    // If no refresh token is provided, return a 401 error (unauthenticated)
    if (!refreshToken) {
        return res.status(401).send({ message: 'unauthenticated' });
    }

    // If the provided refresh token is not valid (not in the stored list), return a 403 error (forbidden)
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).send({ message: 'invalid refresh token' });
    }

    // Verify the validity of the refresh token
    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) {
            // If the token is invalid, return a 403 error
            return res.status(403).send({ message: 'invalid refresh token' });
        }

        // If valid, generate a new access token
        const accessToken = generateAccessToken(user);
        // Send the new access token as a response
        res.send({ accessToken });
    });
});

// Route to get authenticated user details
router.get('/user', async (req, res) => {
    // Retrieve the JWT access token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

    // If no token is provided, return a 401 error (unauthenticated)
    if (!token) {
        return res.status(401).send({ message: 'unauthenticated' });
    }

    try {
        // Verify the JWT token and extract the user's ID from the claims
        const claims = jwt.verify(token, JWT_SECRET);

        // Find the user by ID (extracted from the token claims)
        const user = await User.findOne({ _id: claims._id });
        if (!user) {
            return res.status(404).send({ message: 'user not found' });
        }

        // Exclude the password field from the response
        const { password, ...data } = await user.toJSON();

        // Send the user data as a response
        res.send(data);
    } catch (e) {
        // If token verification fails, return a 401 error (unauthenticated)
        return res.status(401).send({ message: 'unauthenticated' });
    }
});

// Export the router to be used in other parts of the application
module.exports = router;
