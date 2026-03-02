/**
 * ============================================================================
 * STUDENT DATA MODEL - Database Schema Definition
 * ============================================================================
 *
 * This model stores the student's onboarding information which is used
 * to generate personalized learning paths.
 *
 * DATA SECTIONS:
 * 1. Profile - Basic student information
 * 2. Goals - Learning objectives and target skills
 * 3. Availability - Weekly study schedule
 *
 * The combination of these three sections determines:
 * - Which courses to include in the learning path
 * - How much content to assign per week
 * - The pace and intensity of the program
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import mongoose from "mongoose";

/**
 * Student Data Schema
 *
 * Captures all information needed to create a personalized learning experience.
 * This data is collected during the onboarding flow and can be updated later.
 */
const studentDataSchema = new mongoose.Schema(
  {
    /**
     * Reference to the User who owns this data
     * Links student data to their authentication account
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User reference is required"],
      ref: "User",
      unique: true, // One student data record per user
    },

    // =====================================================================
    // PROFILE SECTION
    // Basic information about the student
    // =====================================================================
    profile: {
      /**
       * Student's full name
       * Used for personalization in the learning path
       */
      name: {
        type: String,
        required: [true, "Student name is required"],
        trim: true,
      },

      /**
       * Current academic year
       * Helps determine appropriate pacing and content depth
       * - 1st year: More foundational content
       * - 4th year: More advanced, job-focused content
       */
      year: {
        type: String,
        enum: {
          values: ["1st", "2nd", "3rd", "4th"],
          message: "Year must be 1st, 2nd, 3rd, or 4th",
        },
        required: [true, "Academic year is required"],
      },

      /**
       * Preferred language for learning
       * Affects which video content versions to recommend
       */
      languageComfort: {
        type: String,
        enum: {
          values: ["telugu", "english", "other"],
          message: "Language must be telugu, english, or other",
        },
        required: [true, "Language preference is required"],
      },

      /**
       * Whether the student has academic backlogs
       * If true, assigns "basic" program with slower pace
       * This gives more time to balance studies
       */
      hasBacklogs: {
        type: Boolean,
        required: true,
        default: false,
      },
    },

    // =====================================================================
    // GOALS SECTION
    // What the student wants to achieve
    // =====================================================================
    goals: {
      /**
       * Primary learning objective
       * - placement: Preparing for full-time job interviews
       * - internship: Preparing for internship opportunities
       * - skill-upgrade: General skill improvement
       */
      primaryGoal: {
        type: String,
        enum: {
          values: ["placement", "internship", "skill-upgrade"],
          message: "Goal must be placement, internship, or skill-upgrade",
        },
        required: [true, "Primary goal is required"],
      },

      /**
       * Technology stack to focus on
       * Determines which courses to include in the learning path
       *
       * - frontend: HTML, CSS, JavaScript, React
       * - backend: Node.js, Express, MongoDB
       * - fullstack: Complete web development path
       * - ai-ml: Python, Data Science, Machine Learning
       * - dsa: Data Structures and Algorithms
       * - sql: Database and SQL fundamentals
       * - python: Python programming basics
       */
      targetStack: {
        type: String,
        enum: {
          values: [
            "frontend",
            "backend",
            "fullstack",
            "ai-ml",
            "dsa",
            "sql",
            "python",
          ],
          message: "Invalid target stack selection",
        },
        required: [true, "Target stack is required"],
      },

      /**
       * Self-assessed current skill level (1-5)
       *
       * 1-2: Beginner (slow pace, more time per topic)
       * 3: Intermediate (standard pace)
       * 4-5: Advanced (faster pace, can skip basics)
       *
       * This affects:
       * - Program type (basic/academy/intensive)
       * - Session durations
       * - Amount of practice material
       */
      currentSkillLevel: {
        type: Number,
        min: [1, "Skill level must be at least 1"],
        max: [5, "Skill level cannot exceed 5"],
        required: [true, "Current skill level is required"],
      },
    },

    // =====================================================================
    // AVAILABILITY SECTION
    // How much time the student can dedicate to learning
    // =====================================================================
    availability: {
      /**
       * Hours available per weekday (Monday-Friday)
       * Multiplied by 5 for weekly weekday hours
       */
      weekdayHours: {
        type: Number,
        required: [true, "Weekday hours are required"],
        min: [0, "Hours cannot be negative"],
        max: [12, "Maximum 12 hours per weekday"],
      },

      /**
       * Hours available per weekend day (Saturday-Sunday)
       * Multiplied by 2 for weekly weekend hours
       */
      weekendHours: {
        type: Number,
        required: [true, "Weekend hours are required"],
        min: [0, "Hours cannot be negative"],
        max: [16, "Maximum 16 hours per weekend day"],
      },

      /**
       * Preferred time of day for studying
       * Used for recommendations and scheduling tips
       *
       * - morning: 6 AM - 12 PM
       * - afternoon: 12 PM - 6 PM
       * - late-night: 6 PM - 12 AM
       */
      preferredWindow: {
        type: String,
        enum: {
          values: ["morning", "afternoon", "late-night"],
          message: "Window must be morning, afternoon, or late-night",
        },
        required: [true, "Preferred study window is required"],
      },

      /**
       * How long the learning plan should span
       * Determines total content to include in the generated path
       *
       * Shorter plans: Focus on essentials, higher intensity
       * Longer plans: More comprehensive, sustainable pace
       */
      planDuration: {
        type: String,
        enum: {
          values: [
            "1-week",
            "2-week",
            "3-week",
            "4-week",
            "1-month",
            "2-month",
          ],
          message: "Invalid plan duration",
        },
        required: [true, "Plan duration is required"],
      },
    },
  },
  {
    /**
     * Mongoose Timestamps
     * Automatically adds:
     * - createdAt: Date of initial onboarding
     * - updatedAt: Date of last profile update
     */
    timestamps: true,
  },
);

// =============================================================================
// MODEL EXPORT
// =============================================================================

const StudentData = mongoose.model("StudentData", studentDataSchema);

export default StudentData;
