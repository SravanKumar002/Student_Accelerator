/**
 * ============================================================================
 * RATE LIMITER MIDDLEWARE - Brute-Force Protection
 * ============================================================================
 *
 * Prevents abuse of authentication endpoints by limiting the number of
 * requests a single IP can make in a given time window.
 *
 * RULES:
 * - Login:    max 10 attempts per 15 minutes
 * - Register: max 5  attempts per 15 minutes
 * - General:  max 100 requests per 15 minutes (for all other routes)
 *
 * USAGE IN ROUTES:
 *   import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter.js';
 *   router.post('/login',    loginLimiter,    loginUser);
 *   router.post('/register', registerLimiter, registerUser);
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import rateLimit from "express-rate-limit";

// =============================================================================
// LOGIN RATE LIMITER — 10 attempts / 15 min
// =============================================================================

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    message:
      "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate-limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// =============================================================================
// REGISTER RATE LIMITER — 5 attempts / 15 min
// =============================================================================

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many registration attempts from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================================================
// GENERAL API RATE LIMITER — 100 requests / 15 min
// =============================================================================

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests from this IP. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
