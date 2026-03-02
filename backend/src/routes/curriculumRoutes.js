/**
 * ============================================================================
 * CURRICULUM ROUTES - Course & Session Data API Endpoints
 * ============================================================================
 *
 * This file defines all curriculum-related routes.
 * Routes connect HTTP endpoints to controller functions.
 *
 * BASE PATH: /api/curriculum
 *
 * ALL ROUTES ARE PUBLIC (no authentication required)
 *
 * ENDPOINTS:
 * - GET /courses                      - List all available courses
 * - GET /courses/:courseName/topics   - Get topics for a specific course
 * - GET /courses/:courseName/sessions - Get all sessions for a course
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import express from "express";
import {
  getCourses,
  getTopics,
  getSessions,
} from "../controllers/curriculumController.js";

// =============================================================================
// ROUTER SETUP
// =============================================================================

const router = express.Router();

// =============================================================================
// PUBLIC ROUTES - Curriculum is publicly accessible
// =============================================================================

/**
 * @route   GET /api/curriculum/courses
 * @desc    Get list of all available courses in the curriculum
 * @access  Public
 * @returns Array of course names
 *
 * @example Response:
 * ["Build Your Own Static Website", "Programming Foundations", ...]
 */
router.get("/courses", getCourses);

/**
 * @route   GET /api/curriculum/courses/:courseName/topics
 * @desc    Get all topics for a specific course (in learning order)
 * @access  Public
 * @param   courseName - The course name (URL encoded)
 * @returns Array of topic names, sorted by curriculum order
 *
 * @example GET /api/curriculum/courses/Programming%20Foundations/topics
 * @example Response:
 * ["Introduction to Python", "Type Conversions", "Functions", ...]
 */
router.get("/courses/:courseName/topics", getTopics);

/**
 * @route   GET /api/curriculum/courses/:courseName/sessions
 * @desc    Get all sessions for a specific course (in learning order)
 * @access  Public
 * @param   courseName - The course name (URL encoded)
 * @returns Array of session objects with metadata
 *
 * @example GET /api/curriculum/courses/Node%20JS/sessions
 * @example Response:
 * [
 *   { sessionName: "Introduction to Node JS", topic: "...", durationMins: 30 },
 *   ...
 * ]
 */
router.get("/courses/:courseName/sessions", getSessions);

// =============================================================================
// EXPORT ROUTER
// =============================================================================

export default router;
