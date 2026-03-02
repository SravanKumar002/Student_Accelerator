/**
 * ============================================================================
 * CURRICULUM MODEL - Database Schema Definition
 * ============================================================================
 *
 * This model stores the learning curriculum data imported from CCBP.
 * Each document represents a single learning session (video, quiz, practice).
 *
 * DATA HIERARCHY:
 * Course → Topic → Session (this model)
 *
 * Example:
 * - Course: "Programming Foundations"
 *   - Topic: "Introduction to Python"
 *     - Session: "Python Basics Video"
 *     - Session: "Python Practice Quiz"
 *     - Session: "Coding Practice: Variables"
 *
 * DATA SOURCE:
 * This data is imported from curriculum CSV files using the import scripts
 * in the /scripts folder. The sequenceNumber preserves the original order.
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import mongoose from "mongoose";

/**
 * Curriculum Schema
 *
 * Stores individual learning sessions with all metadata needed
 * for path generation and CCBP portal URL construction.
 */
const curriculumSchema = new mongoose.Schema(
  {
    // =====================================================================
    // COURSE & TOPIC IDENTIFICATION
    // =====================================================================

    /**
     * Name of the course this session belongs to
     * Example: "Programming Foundations", "Node JS", "Introduction to React JS"
     */
    courseName: {
      type: String,
      index: true, // Indexed for fast filtering by course
    },

    /**
     * CCBP Course ID
     * Used to construct learning portal URLs
     * Example: "a8669d9b-990a-4c77-9de3-a2c9e5a3d8c7"
     */
    courseId: {
      type: String,
      required: [true, "Course ID is required"],
    },

    /**
     * Name of the topic within the course
     * Example: "Introduction to Python", "For Loop", "Functions"
     */
    topic: {
      type: String,
      index: true,
    },

    /**
     * CCBP Topic ID
     * Used to construct learning portal URLs
     */
    topicId: {
      type: String,
    },

    // =====================================================================
    // SESSION DETAILS
    // =====================================================================

    /**
     * Display name of the session
     * This is what students see in their learning path
     * Example: "Python Variables | Video", "Coding Practice: Loops"
     */
    sessionName: {
      type: String,
    },

    /**
     * Type of learning activity
     *
     * Types and typical durations:
     * - LEARNING_SET: Video/reading content (~18 mins)
     * - PRACTICE: Coding exercises (~60 mins)
     * - QUESTION_SET: Multiple coding problems (~60 mins)
     * - QUIZ: Multiple choice questions (~12 mins)
     * - EXAM: Graded MCQ exam (~15 mins)
     * - ASSESSMENT: Comprehensive test (~30 mins)
     * - PROJECT: Hands-on project (~120 mins)
     */
    setType: {
      type: String,
    },

    /**
     * CCBP Unit ID (Session ID)
     * Used to construct direct links to the learning portal
     */
    unitId: {
      type: String,
    },

    /**
     * Estimated duration in minutes
     * If not provided, defaults are applied based on setType
     */
    duration: {
      type: String, // Stored as string from CSV, converted when used
    },

    // =====================================================================
    // ADDITIONAL METADATA
    // =====================================================================

    /**
     * Available languages for this content
     * Example: "English, Telugu"
     */
    languages: {
      type: String,
    },

    /**
     * Direct link to the session in CCBP portal
     * May be empty; URLs can be constructed from IDs
     */
    sessionLink: {
      type: String,
    },

    /**
     * Learning outcomes for this session
     * What students will learn/achieve after completion
     */
    outcomes: {
      type: String,
    },

    /**
     * Prerequisites for this session
     * What students should know before starting
     */
    prerequisites: {
      type: String,
    },

    /**
     * Whether this is technical or non-technical content
     * Used for filtering and recommendations
     */
    techNonTech: {
      type: String,
    },

    /**
     * Sequence number from the original CSV
     * IMPORTANT: This preserves the intended learning order
     * Used as a tiebreaker when sorting sessions
     */
    sequenceNumber: {
      type: Number,
      index: true, // Indexed for efficient sorting
    },
  },
  {
    /**
     * Mongoose Timestamps
     * - createdAt: Date when curriculum was imported
     * - updatedAt: Date of last update
     */
    timestamps: true,
  },
);

// =============================================================================
// INDEXES FOR QUERY OPTIMIZATION
// =============================================================================

/**
 * Compound index for efficient course + topic queries
 * Used when fetching sessions for a specific course
 */
curriculumSchema.index({ courseName: 1, sequenceNumber: 1 });

// =============================================================================
// MODEL EXPORT
// =============================================================================

const Curriculum = mongoose.model("Curriculum", curriculumSchema);

export default Curriculum;
