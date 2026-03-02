import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user exists in MongoDB
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password for MongoDB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in MongoDB
        const user = await User.create({
            name: name || 'User',
            email,
            password: hashedPassword,
            role: role || 'student',
        });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data format' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in MongoDB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password || '');

        if (isMatch) {
            return res.json({
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        const { credential, role } = req.body;

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub: googleId, picture } = ticket.getPayload();

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Link google account to existing email if not linked
            if (!user.googleId) {
                user.googleId = googleId;
                user.avatar = picture || user.avatar;
                await user.save();
            }
        } else {
            // Create user for first time Google login
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture,
                role: role || 'coach', // Defaulting to coach for demonstration purposes based on the request
            });
        }

        return res.json({
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: 'Invalid Google Identity token', error: error.message });
    }
};

// @desc    Authenticate with Firebase Google Sign-In
// @route   POST /api/auth/firebase-google
// @access  Public
export const firebaseGoogleLogin = async (req, res) => {
    try {
        const { idToken, name, email, role } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Update name if provided and googleId if not set
            if (name && !user.name) {
                user.name = name;
            }
            if (!user.googleId) {
                user.googleId = `firebase_${email}`;
            }
            await user.save();
        } else {
            // Create user for first time Google login
            // Use googleId to bypass password requirement in User model
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                googleId: `firebase_${email}`,
                role: role || 'coach',
            });
        }

        return res.json({
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Firebase Google Auth Error:", error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};
