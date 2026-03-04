/**
 * ============================================================================
 * TYPE DEFINITIONS - TypeScript Interfaces
 * ============================================================================
 *
 * This file contains all TypeScript type definitions used throughout
 * the Student Accelerator frontend application.
 *
 * ORGANIZATION:
 * 1. Student Data Types - Profile, goals, availability
 * 2. Learning Path Types - Generated path structure
 * 3. UI Types - Form steps and component props
 *
 * These types ensure type safety and provide excellent IDE support
 * (autocomplete, error detection, documentation on hover).
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

// =============================================================================
// STUDENT DATA TYPES
// =============================================================================

/**
 * Student Profile
 *
 * Basic information about the student collected during onboarding.
 * This data helps personalize the learning experience.
 */
export interface StudentProfile {
  /** Student's full name - used for personalization */
  name: string;

  /** Current academic year - affects content recommendations */
  year: "1st" | "2nd" | "3rd" | "4th";

  /** Student's email address */
  email: string;

  /** Student's phone number */
  phone: string;
}

/**
 * Learning Goals
 *
 * Defines what the student wants to achieve and which technologies
 * they want to focus on.
 */
export interface LearningGoals {
  /**
   * Technology stack to focus on
   * Each stack has a predefined sequence of courses
   */
  targetStack:
    | "fullstack" // Complete web development path
    | "frontend" // HTML, CSS, JavaScript, React
    | "backend" // Node.js, Express, MongoDB
    | "ai-ml" // Python, Data Science, ML
    | "dsa" // Data Structures & Algorithms
    | "sql" // Database fundamentals
    | "python" // Python programming
    | "applied-genai"; // Generative AI, LLM Apps, AI Projects

  /** Specific course name (or 'all' for full track) */
  courseName: string;

  /** ID of last completed session (for resuming) */
  lastCompletedSessionId: string;

  /**
   * Self-assessed learning pace (1-3)
   * - 1: Slow Learner
   * - 2: Steady
   * - 3: Fast Learner
   */
  currentSkillLevel: number;
}

/**
 * Weekly Availability
 *
 * Defines how much time the student can dedicate to learning
 * and their preferred study schedule.
 */
export interface Availability {
  /** Hours available per weekday (Monday-Friday) */
  weekdayHours: number;

  /** Hours available per weekend day (Saturday-Sunday) */
  weekendHours: number;

  /** Preferred time of day for studying */
  preferredWindow: "morning" | "afternoon" | "late-night";

  /** Total duration of the learning plan */
  planDuration:
    | "1-week"
    | "2-week"
    | "3-week"
    | "1-month"
    | "2-month";
}

/**
 * Complete Student Data
 *
 * Combines profile, goals, and availability into a single object.
 * This is what gets sent to the backend for path generation.
 */
export interface StudentData {
  profile: StudentProfile;
  goals: LearningGoals;
  availability: Availability;
}

// =============================================================================
// LEARNING PATH TYPES
// =============================================================================

/**
 * Single Learning Session
 *
 * Represents one unit of learning content (video, quiz, practice).
 */
export interface PathSession {
  /** Unique identifier for the session */
  id: string;

  /** Topic this session belongs to */
  topic: string;

  /** Display name of the session */
  sessionName: string;

  /** Estimated duration in minutes */
  durationMins: number;

  /** Type of session (LEARNING_SET, QUIZ, PRACTICE, etc.) */
  setType?: string;

  /** Direct link to CCBP learning portal (if available) */
  ccbpUrl?: string | null;
}

/**
 * Course Transition
 *
 * Marks when the student moves from one course to another
 * within their learning path.
 */
export interface CourseTransition {
  /** Name of the completed course */
  completed: string;

  /** Name of the next course */
  next: string;

  /** Celebratory message for the user */
  message: string;
}

/**
 * Learning Path Module
 *
 * Represents a week or unit of learning in the generated path.
 * Contains multiple sessions grouped by time allocation.
 */
export interface PathModule {
  /** Unique identifier (e.g., "mod-week-1") */
  id: string;

  /** Display name (e.g., "Week 1 Plan") */
  name: string;

  /** Main topic or theme for this module */
  topic: string;

  /** Total hours required for this module */
  hoursRequired: number;

  /** Number of weeks allocated for this module */
  weeksAllocated: number;

  /** Human-readable description of module content */
  description: string;

  /** Current progress status */
  status: "upcoming" | "current" | "completed";

  /** Array of learning sessions in this module */
  sessions?: PathSession[];

  /** Courses covered in this module */
  coursesInWeek?: string[];

  /** Course transitions that occur in this module */
  courseTransitions?: CourseTransition[];
}

/**
 * Next Course Suggestion
 *
 * Recommends what the student should learn next after
 * completing their current plan.
 */
export interface PathSuggestion {
  /** Recommendation message */
  message: string;

  /** Name of the suggested next course */
  nextCourse: string;
}

/**
 * Track Completion Status
 *
 * Returned when a student completes all courses in their
 * chosen learning track.
 */
export interface TrackCompletion {
  /** Whether the track is fully completed */
  completed: boolean;

  /** Human-readable track name */
  trackName: string;

  /** Congratulatory message */
  message: string;

  /** Suggested next track (null if all done) */
  nextTrack: string | null;

  /** Human-readable name of next track */
  nextTrackName: string | null;

  /** Specific courses to consider next */
  suggestedCourses: string[];
}

/**
 * Complete Learning Path Data
 *
 * The full response from the path generation API.
 * Contains everything needed to render the learning timeline.
 */
export interface LearningPathData {
  /** Original student data used for generation */
  student: StudentData;

  /** Assigned program type based on skill level */
  program: "basic" | "academy" | "intensive";

  /** Array of weekly modules with sessions */
  modules: PathModule[];

  /** Total number of weeks in the plan */
  totalWeeks: number;

  /** Student's weekly study hours */
  weeklyHours: number;

  /** Optional: Next course recommendation */
  suggestion?: PathSuggestion;

  /** Optional: Track completion status */
  trackCompletion?: TrackCompletion;
}

// =============================================================================
// UI TYPES
// =============================================================================

/**
 * Form Step
 *
 * The three steps in the onboarding wizard.
 * Used for navigation and progress indication.
 */
export type FormStep = "profile" | "goals" | "availability";
