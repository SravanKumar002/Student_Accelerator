/**
 * ============================================================================
 * AUTH MIDDLEWARE - Request Authentication
 * ============================================================================
 *
 * This middleware verifies JWT tokens to protect private routes.
 * It ensures only authenticated users can access certain endpoints.
 *
 * HOW IT WORKS:
 * 1. Client sends request with Authorization header: "Bearer <token>"
 * 2. Middleware extracts and verifies the JWT token
 * 3. If valid, attaches user data to req.user and calls next()
 * 4. If invalid, returns 401 Unauthorized response
 *
 * USAGE:
 * import { protect } from './middlewares/authMiddleware.js';
 * router.get('/protected-route', protect, myController);
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * JWT Secret Key
 * Should be set in environment variables for security
 * Fallback value is for development only - NEVER use in production!
 */
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// =============================================================================
// PROTECT MIDDLEWARE
// =============================================================================

/**
 * Authentication Middleware
 *
 * Verifies that the request has a valid JWT token and attaches
 * the authenticated user to the request object.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 *
 * @example
 * // In route definition:
 * router.get('/me', protect, getMe);
 *
 * // In controller, access user:
 * const userId = req.user.id;
 */
export const protect = async (req, res, next) => {
  let token = null;

  // -------------------------------------------------------------------------
  // STEP 1: Extract token from Authorization header
  // -------------------------------------------------------------------------
  // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    // Split "Bearer <token>" and get the token part
    token = authHeader.split(" ")[1];
  }

  // -------------------------------------------------------------------------
  // STEP 2: Check if token exists
  // -------------------------------------------------------------------------

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }

  // -------------------------------------------------------------------------
  // STEP 3: Verify token and get user
  // -------------------------------------------------------------------------

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user by ID from the token payload
    // Exclude password from the returned user object for security
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    // Attach user to request object for use in controllers
    req.user = user;

    // Continue to the next middleware/controller
    return next();
  } catch (error) {
    // Token verification failed (expired, invalid signature, etc.)
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "Not authorized, token invalid",
    });
  }
};
