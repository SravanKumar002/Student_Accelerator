/**
 * ============================================================================
 * GENERATED PATH MODEL - Stores Generated Learning Paths
 * ============================================================================
 *
 * Each time a student generates a learning path via /api/student/generate-path,
 * the result is persisted here so coaches can view and manage all paths from
 * their dashboard.
 *
 * FIELDS:
 * - student_name   : The student's display name (from profile)
 * - target_stack   : Chosen learning stack (frontend, backend, fullstack, etc.)
 * - program        : Determined program level (basic, academy, intensive)
 * - total_weeks    : Number of weeks in the generated path
 * - weekly_hours   : Hours per week the student committed
 * - current_skill_level : Self-reported skill level (1–5)
 * - modules        : Simplified module list for dashboard display
 * - is_completed   : Whether a coach has marked the path as completed
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import mongoose from "mongoose";

const generatedPathSchema = new mongoose.Schema(
  {
    /** Student's full name */
    student_name: {
      type: String,
      required: true,
      trim: true,
    },

    /** Target learning stack */
    target_stack: {
      type: String,
      required: true,
      enum: ["frontend", "backend", "fullstack", "ai-ml", "dsa", "sql", "python"],
      default: "fullstack",
    },

    /** Program level (auto-determined from skill + backlogs) */
    program: {
      type: String,
      required: true,
      enum: ["basic", "academy", "intensive"],
      default: "academy",
    },

    /** Total weeks in the generated path */
    total_weeks: {
      type: Number,
      required: true,
      default: 1,
    },

    /** Weekly hours committed */
    weekly_hours: {
      type: Number,
      default: 14,
    },

    /** Self-reported skill level (1–5) */
    current_skill_level: {
      type: Number,
      default: 2,
    },

    /** Simplified modules for dashboard / detail view */
    modules: [
      {
        topic: { type: String, required: true },
        hoursRequired: { type: Number, default: 0 },
        weeksAllocated: { type: Number, default: 1 },
        description: { type: String, default: "" },
      },
    ],

    /** Whether the coach marked this path as completed */
    is_completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// =============================================================================
// INDEXES — speed up common dashboard queries
// =============================================================================

generatedPathSchema.index({ created_at: -1 });
generatedPathSchema.index({ target_stack: 1 });
generatedPathSchema.index({ program: 1 });

// =============================================================================
// VIRTUALS — map _id → id for frontend compatibility
// =============================================================================

generatedPathSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

const GeneratedPath = mongoose.model("GeneratedPath", generatedPathSchema);

export default GeneratedPath;
