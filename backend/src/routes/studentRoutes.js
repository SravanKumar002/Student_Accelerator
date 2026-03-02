/**
 * ============================================================================
 * STUDENT ROUTES - Student Data & Learning Path API Endpoints
 * ============================================================================
 *
 * This file defines all student-related routes.
 * Routes connect HTTP endpoints to controller functions.
 *
 * BASE PATH: /api/student
 *
 * PUBLIC ROUTES:
 * - POST /generate-path    - Generate personalized learning path
 *
 * PROTECTED ROUTES (JWT token required):
 * - GET  /me               - Get student's profile data
 * - POST /me               - Create student data (onboarding)
 * - PUT  /me               - Update student data
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import express from "express";
import {
  getStudentData,
  createStudentData,
  updateStudentData,
  generatePath,
  getAllPaths,
  deletePath,
  togglePathComplete,
  savePath,
} from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateGeneratePath } from "../middlewares/validate.js";

// =============================================================================
// ROUTER SETUP
// =============================================================================

const router = express.Router();

// =============================================================================
// PUBLIC ROUTES - No authentication required
// =============================================================================

/**
 * @route   POST /api/student/generate-path
 * @desc    Generate a personalized learning path based on student data
 * @access  Public (allows demo usage without login)
 * @body    { profile, goals, availability }
 * @returns Learning path with weekly modules and sessions
 */
router.post("/generate-path", validateGeneratePath, generatePath);

/**
 * @route   POST /api/student/save-path
 * @desc    Explicitly save a generated learning path (student clicks Save)
 * @access  Public
 * @body    { student, program, modules, totalWeeks, weeklyHours }
 * @returns { message, id }
 */
router.post("/save-path", savePath);

// =============================================================================
// PROTECTED ROUTES - JWT authentication required
// =============================================================================

/**
 * Coach Dashboard Endpoints
 *
 * @route   GET    /api/student/all          - Fetch all generated paths
 * @route   DELETE /api/student/:id          - Delete a generated path
 * @route   PATCH  /api/student/:id/complete - Toggle completion status
 * @access  Private (requires JWT token)
 */
router.get("/all", getAllPaths);
router.delete("/:id", protect, deletePath);
router.patch("/:id/complete", protect, togglePathComplete);

/**
 * Student Profile CRUD Operations
 * All operations on /me require authentication
 *
 * @route   GET  /api/student/me - Get student data
 * @route   POST /api/student/me - Create student data (first time)
 * @route   PUT  /api/student/me - Update student data
 * @access  Private (requires JWT token)
 * @header  Authorization: Bearer <token>
 */
router
  .route("/me")
  .get(protect, getStudentData)
  .post(protect, createStudentData)
  .put(protect, updateStudentData);

// =============================================================================
// EXPORT ROUTER
// =============================================================================

export default router;
