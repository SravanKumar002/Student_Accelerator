/**
 * ============================================================================
 * AUTH SERVICE - Business Logic Layer
 * ============================================================================
 *
 * This service handles all authentication-related business logic:
 * - User registration and login
 * - Password hashing and verification
 * - JWT token generation
 * - Google OAuth integration
 *
 * Following the MVC pattern, this service:
 * - Separates business logic from controllers (thin controllers, fat services)
 * - Can be easily unit tested in isolation
 * - Centralizes authentication logic for reuse across the app
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

/**
 * Initialize Google OAuth client for verifying Google sign-in tokens.
 * The client ID should be set in environment variables for security.
 */
const googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * JWT Configuration
 * - Token expires in 30 days for user convenience
 * - Uses environment variable for secret (falls back to default for dev only)
 */
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "secret123",
  expiresIn: "30d",
};

/**
 * Password Hashing Configuration
 * - Salt rounds of 10 provides good security without being too slow
 */
const PASSWORD_SALT_ROUNDS = 10;

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Generates a JWT token for user authentication.
 *
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} - A signed JWT token
 *
 * @example
 * const token = generateAuthToken(user._id);
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
function generateAuthToken(userId) {
  return jwt.sign({ id: userId }, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });
}

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param {string} plainPassword - The raw password from user input
 * @returns {Promise<string>} - The hashed password to store in database
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compares a plain text password with a hashed password.
 *
 * @param {string} plainPassword - The password from user input
 * @param {string} hashedPassword - The stored hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword || "");
}

/**
 * Formats user data for API response (excludes sensitive info like password).
 *
 * @param {Object} user - The user document from MongoDB
 * @param {string} token - The JWT token for this session
 * @returns {Object} - Safe user object for API response
 */
function formatUserResponse(user, token) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    token: token,
  };
}

// -----------------------------------------------------------------------------
// SERVICE METHODS - Main Business Logic
// -----------------------------------------------------------------------------

/**
 * Registers a new user with email and password.
 *
 * FLOW:
 * 1. Validate required fields (email, password)
 * 2. Check if email is already registered
 * 3. Hash the password for secure storage
 * 4. Create user in database
 * 5. Generate auth token and return user data
 *
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's chosen password
 * @param {string} [userData.role='student'] - User role (student/coach/admin)
 * @returns {Promise<Object>} - User data with auth token
 * @throws {Error} - If validation fails or email exists
 */
export async function registerUser({
  name,
  email,
  password,
  role = "student",
}) {
  // Step 1: Validate required fields
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Step 2: Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Step 3: Hash password for secure storage
  const hashedPassword = await hashPassword(password);

  // Step 4: Create user in database
  const newUser = await User.create({
    name: name || "User",
    email,
    password: hashedPassword,
    role,
  });

  // Step 5: Generate token and return formatted response
  const token = generateAuthToken(newUser._id);
  return formatUserResponse(newUser, token);
}

/**
 * Authenticates a user with email and password.
 *
 * FLOW:
 * 1. Find user by email
 * 2. Verify password matches
 * 3. Generate new auth token
 * 4. Return user data with token
 *
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} - User data with auth token
 * @throws {Error} - If credentials are invalid
 */
export async function loginUser({ email, password }) {
  // Step 1: Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Step 2: Verify password
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Step 3 & 4: Generate token and return response
  const token = generateAuthToken(user._id);
  return formatUserResponse(user, token);
}

/**
 * Authenticates or registers a user via Google OAuth.
 *
 * FLOW:
 * 1. Verify the Google ID token
 * 2. Extract user info from Google payload
 * 3. Check if user exists in database
 *    - If exists: Update Google ID if needed
 *    - If not: Create new user account
 * 4. Generate auth token and return
 *
 * @param {Object} params - Google auth parameters
 * @param {string} params.credential - The Google ID token from frontend
 * @param {string} [params.role='coach'] - Default role for new users
 * @returns {Promise<Object>} - User data with auth token
 * @throws {Error} - If Google token verification fails
 */
export async function googleLogin({ credential, role = "coach" }) {
  // Step 1: Verify Google token
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  // Step 2: Extract user info from Google
  const googlePayload = ticket.getPayload();
  const { email, name, sub: googleId, picture } = googlePayload;

  // Step 3: Find or create user
  let user = await User.findOne({ email });

  if (user) {
    // User exists - link Google account if not already linked
    if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      await user.save();
    }
  } else {
    // Create new user from Google profile
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture,
      role,
    });
  }

  // Step 4: Generate token and return
  const token = generateAuthToken(user._id);
  return formatUserResponse(user, token);
}

/**
 * Gets the current authenticated user's profile.
 *
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} - User data (without password)
 * @throws {Error} - If user not found
 */
export async function getCurrentUser(userId) {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
