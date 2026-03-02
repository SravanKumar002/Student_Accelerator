/**
 * ============================================================================
 * EXPRESS APPLICATION CONFIGURATION
 * ============================================================================
 *
 * This file sets up the Express application with all middleware and routes.
 * It follows the principle of separating app configuration from server startup.
 *
 * ARCHITECTURE OVERVIEW:
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                           Express Application                           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  Middleware Layer                                                       │
 * │  ├── JSON Parser     - Parses incoming JSON request bodies              │
 * │  ├── CORS            - Enables cross-origin requests                    │
 * │  ├── Helmet          - Security headers                                 │
 * │  └── Morgan          - HTTP request logging (dev only)                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  Routes Layer                                                           │
 * │  ├── /api/auth       - Authentication endpoints                         │
 * │  ├── /api/student    - Student data and path generation                 │
 * │  └── /api/curriculum - Course and session data                          │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  Error Handler       - Catches and formats all errors                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import curriculumRoutes from "./routes/curriculumRoutes.js";

// =============================================================================
// CREATE EXPRESS APPLICATION
// =============================================================================

const app = express();

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

/**
 * Body Parser Middleware
 * Parses incoming JSON request bodies and makes them available on req.body
 */
app.use(express.json());

/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Allows the frontend (running on a different port/domain) to make requests
 * to this API. Without this, browser security would block the requests.
 */
app.use(cors());

/**
 * Helmet Security Middleware
 * Adds various HTTP headers to protect against common web vulnerabilities:
 * - XSS protection
 * - Content Security Policy
 * - Clickjacking prevention
 * - MIME sniffing prevention
 *
 * Note: crossOriginResourcePolicy is disabled to allow image/asset loading
 */
app.use(helmet({ crossOriginResourcePolicy: false }));

/**
 * Morgan HTTP Logger (Development Only)
 * Logs all incoming HTTP requests for debugging:
 * Example output: "GET /api/curriculum/courses 200 5ms"
 */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =============================================================================
// API ROUTES
// =============================================================================

/**
 * Authentication Routes
 * Handles user registration, login, and Google OAuth
 *
 * Endpoints:
 * - POST /api/auth/register - Create new account
 * - POST /api/auth/login    - Login with email/password
 * - POST /api/auth/google   - Login with Google
 * - GET  /api/auth/me       - Get current user profile
 */
app.use("/api/auth", authRoutes);

/**
 * Student Routes
 * Handles student data and learning path generation
 *
 * Endpoints:
 * - GET  /api/student/me           - Get student profile
 * - POST /api/student/me           - Create student profile (onboarding)
 * - PUT  /api/student/me           - Update student profile
 * - POST /api/student/generate-path - Generate personalized learning path
 */
app.use("/api/student", studentRoutes);

/**
 * Curriculum Routes
 * Provides access to course and session data
 *
 * Endpoints:
 * - GET /api/curriculum/courses                     - List all courses
 * - GET /api/curriculum/courses/:name/topics        - Get topics for a course
 * - GET /api/curriculum/courses/:name/sessions      - Get sessions for a course
 */
app.use("/api/curriculum", curriculumRoutes);

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

/**
 * Root endpoint for health checks and API status verification.
 * Useful for load balancers and monitoring systems.
 *
 * @route GET /
 * @returns {string} Status message
 */
app.get("/", (req, res) => {
  res.send("🚀 Student Accelerator API is running...");
});

// =============================================================================
// GLOBAL ERROR HANDLER
// =============================================================================

/**
 * Custom Error Handler Middleware
 *
 * This catches all errors thrown in route handlers and middleware.
 * It standardizes error responses and hides stack traces in production.
 *
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
app.use((err, req, res, next) => {
  // Use the status code from the response, or default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);
  res.json({
    message: err.message,
    // Only include stack trace in development for debugging
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// =============================================================================
// EXPORT APPLICATION
// =============================================================================

export default app;
