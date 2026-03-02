/**
 * ============================================================================
 * USER MODEL - Database Schema Definition
 * ============================================================================
 *
 * This model defines the structure for user accounts in the system.
 *
 * USER TYPES:
 * - Student: Primary users who follow learning paths
 * - Coach: Mentors who track student progress
 * - Admin: System administrators
 *
 * AUTHENTICATION METHODS:
 * - Email/Password: Traditional registration with hashed password
 * - Google OAuth: Sign in with Google account (no password required)
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import mongoose from "mongoose";

/**
 * User Schema
 *
 * Stores user account information for authentication and authorization.
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * User's full name
     * Used for display purposes and personalization
     */
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    /**
     * User's email address
     * - Must be unique across all users
     * - Used as primary identifier for login
     */
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    /**
     * Hashed password for email/password authentication
     * - Required only if user doesn't have Google OAuth linked
     * - Never store plain text passwords!
     */
    password: {
      type: String,
      required: function () {
        // Password is required only for non-Google users
        return !this.googleId;
      },
    },

    /**
     * Google OAuth User ID
     * - Set when user signs in with Google
     * - Allows password-less authentication
     * - 'sparse: true' allows multiple null values while maintaining uniqueness
     */
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    /**
     * User's profile picture URL
     * - Usually populated from Google profile picture
     * - Can be set manually for email/password users
     */
    avatar: {
      type: String,
      default: null,
    },

    /**
     * User's role in the system
     * - student: Can create learning paths and track progress
     * - coach: Can view and mentor multiple students
     * - admin: Full system access
     */
    role: {
      type: String,
      enum: {
        values: ["student", "coach", "admin"],
        message: "Role must be student, coach, or admin",
      },
      default: "student",
    },
  },
  {
    /**
     * Mongoose Timestamps
     * Automatically adds:
     * - createdAt: Date when user registered
     * - updatedAt: Date of last profile update
     */
    timestamps: true,
  },
);

// =============================================================================
// MODEL EXPORT
// =============================================================================

const User = mongoose.model("User", userSchema);

export default User;
