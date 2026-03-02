/**
 * ============================================================================
 * AUTH ROUTES - Authentication API Endpoints
 * ============================================================================
 *
 * This file defines all authentication-related routes.
 * Routes connect HTTP endpoints to controller functions.
 *
 * BASE PATH: /api/auth
 *
 * PUBLIC ROUTES (no authentication required):
 * - POST /register         - Create new user account
 * - POST /login            - Login with email/password
 * - POST /google           - Login with Google OAuth
 * - POST /firebase-google  - Login with Firebase Google OAuth
 *
 * PROTECTED ROUTES (JWT token required):
 * - GET /me                - Get current user's profile
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  firebaseGoogleLogin,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRegister, validateLogin } from "../middlewares/validate.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";

// =============================================================================
// ROUTER SETUP
// =============================================================================

const router = express.Router();

// =============================================================================
// PUBLIC ROUTES - No authentication required
// =============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email and password
 * @access  Public
 * @body    { name, email, password, role? }
 */
router.post("/register", registerLimiter, validateRegister, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post("/login", loginLimiter, validateLogin, loginUser);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google OAuth
 * @access  Public
 * @body    { credential, role? }
 */
router.post("/google", googleLogin);

/**
 * @route   POST /api/auth/firebase-google
 * @desc    Authenticate with Firebase Google OAuth
 * @access  Public
 * @body    { credential, role? }
 */
router.post("/firebase-google", firebaseGoogleLogin);

// =============================================================================
// PROTECTED ROUTES - JWT authentication required
// =============================================================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's profile
 * @access  Private (requires JWT token in Authorization header)
 * @header  Authorization: Bearer <token>
 */
router.get("/me", protect, getMe);

// =============================================================================
// EXPORT ROUTER
// =============================================================================

export default router;
