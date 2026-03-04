/**
 * ============================================================================
 * PATH ENGINE - Client-Side Learning Path Generator
 * ============================================================================
 *
 * This is a FALLBACK path generator that runs on the client side.
 * It's used when the backend API is unavailable.
 *
 * NOTE: The primary path generation happens on the backend with real
 * curriculum data from the database. This client-side version uses
 * predefined estimates and is less accurate.
 *
 * ALGORITHM OVERVIEW:
 * 1. Determine program type (basic/academy/intensive) based on skill level
 * 2. Calculate available study hours per week
 * 3. Map student's target stack to a list of topics
 * 4. Estimate hours per topic and create weekly modules
 * 5. Return a simplified learning path structure
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import {
  StudentData,
  PathModule,
  LearningPathData,
  PathSession,
} from "./types";

// =============================================================================
// CONFIGURATION - Default Session Durations
// =============================================================================

/**
 * DEFAULT DURATIONS BY SET TYPE (in minutes)
 *
 * Used when session duration is not available from the database.
 */
const DEFAULT_DURATIONS: Record<string, number> = {
  LEARNING_SET: 18, // Video/reading content: 15-20 mins
  PRACTICE: 60, // Coding practice: 1 hour
  QUESTION_SET: 60, // Coding questions: 1 hour
  QUIZ: 12, // MCQ quizzes: 10-15 mins
  EXAM: 15, // MCQ exams: 10-15 mins
  ASSESSMENT: 30, // Assessments: 30 mins
  PROJECT: 120, // Projects: 2 hours
};

// =============================================================================
// CONFIGURATION - Learning Pace
// =============================================================================

/**
 * PACE MULTIPLIERS
 *
 * Adjusts session durations based on student's learning speed.
 * - Slow learners need 50% more time
 * - Fast learners need 25% less time
 */
const PACE_MULTIPLIERS: Record<string, number> = {
  slow: 1.5, // 50% more time for beginners
  moderate: 1.0, // Standard pace
  fast: 0.75, // 25% less time for advanced learners
};

// =============================================================================
// CONFIGURATION - Topic Definitions
// =============================================================================

/**
 * TOPIC HOURS AND DESCRIPTIONS
 *
 * Estimated hours and descriptions for each major topic.
 * Used when generating client-side learning paths.
 */
const TOPIC_DEFINITIONS: Record<
  string,
  { name: string; hours: number; description: string }
> = {
  "static-web": {
    name: "Static Website",
    hours: 10,
    description:
      "HTML fundamentals, page structure, semantic tags, forms & accessibility",
  },
  "responsive-web": {
    name: "Responsive Website",
    hours: 14,
    description:
      "CSS Flexbox, Grid, media queries, mobile-first responsive design",
  },
  "modern-responsive": {
    name: "Modern Responsive Design",
    hours: 12,
    description: "Bootstrap, advanced layouts, modern CSS techniques",
  },
  python: {
    name: "Python Foundations",
    hours: 20,
    description: "Core Python, OOP, file handling, data structures & libraries",
  },
  javascript: {
    name: "JavaScript Essentials",
    hours: 25,
    description:
      "ES6+, DOM manipulation, async programming, closures & promises",
  },
  "dynamic-web": {
    name: "Dynamic Web Application",
    hours: 18,
    description:
      "Interactive UIs, event handling, API integration, local storage",
  },
  sql: {
    name: "SQL & Databases",
    hours: 15,
    description:
      "Queries, joins, normalization, indexing, SQLite & relational design",
  },
  nodejs: {
    name: "Node.js",
    hours: 22,
    description:
      "Express, REST APIs, middleware, authentication, server-side JS",
  },
  reactjs: {
    name: "React.js",
    hours: 25,
    description:
      "Components, hooks, state management, routing, modern React patterns",
  },
  mongodb: {
    name: "MongoDB",
    hours: 12,
    description: "CRUD operations, aggregation pipelines, schema design",
  },
  dsa: {
    name: "DSA",
    hours: 40,
    description: "Arrays, trees, graphs, dynamic programming, problem-solving",
  },
  genai: {
    name: "Generative AI",
    hours: 15,
    description: "Prompt engineering, LLM APIs, RAG basics",
  },
  llms: {
    name: "Building LLM Apps",
    hours: 20,
    description: "Fine-tuning, embeddings, deployment patterns",
  },
  "python-ds": {
    name: "Python for Data Science",
    hours: 20,
    description: "NumPy, Pandas, data visualization, ML basics",
  },
  "ai-projects": {
    name: "AI Full-Stack Projects",
    hours: 25,
    description: "MERN stack AI applications, end-to-end deployment",
  },
  "math-ml": {
    name: "Mathematics for ML",
    hours: 15,
    description: "Linear algebra, calculus, statistics for machine learning",
  },
  "statistics": {
    name: "Statistics & Probability",
    hours: 20,
    description: "Descriptive stats, EDA, probability, inferential statistics",
  },
};

// =============================================================================
// CONFIGURATION - Learning Track Definitions
// =============================================================================

/**
 * LEARNING TRACKS
 *
 * Maps each target stack to a sequence of topic IDs.
 * The order represents the recommended learning path.
 */
const LEARNING_TRACKS: Record<string, string[]> = {
  frontend: [
    "static-web",
    "responsive-web",
    "modern-responsive",
    "dynamic-web",
    "javascript",
    "reactjs",
  ],
  backend: ["python", "javascript", "sql", "nodejs", "mongodb"],
  fullstack: [
    "static-web",
    "responsive-web",
    "modern-responsive",
    "dynamic-web",
    "python",
    "javascript",
    "sql",
    "nodejs",
    "reactjs",
    "mongodb",
  ],
  "ai-ml": ["math-ml", "statistics", "python", "python-ds"],
  "applied-genai": ["genai", "llms", "ai-projects"],
  dsa: ["dsa"],
  sql: ["sql", "mongodb"],
  python: ["python", "python-ds"],
};

// =============================================================================
// CONFIGURATION - Program Multipliers
// =============================================================================

/**
 * PROGRAM MULTIPLIERS
 *
 * Different program types have different pacing:
 * - Basic: More time per topic for beginners
 * - Academy: Standard pace
 * - Intensive: Faster pace for advanced students
 */
const PROGRAM_MULTIPLIERS: Record<string, number> = {
  basic: 1.3, // 30% more time
  academy: 1.0, // Standard pace
  intensive: 0.7, // 30% less time
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determines the program type based on student data.
 *
 * @param data - Student profile, goals, and availability
 * @returns Program type: 'basic', 'academy', or 'intensive'
 */
function determineProgram(
  data: StudentData,
): "basic" | "academy" | "intensive" {
  const skillLevel = data.goals.currentSkillLevel;

  // Slow learner gets basic pace
  if (skillLevel === 1) return "basic";

  // Fast learner gets intensive pace
  if (skillLevel === 3) return "intensive";

  // Steady gets standard pace
  return "academy";
}

/**
 * Determines learning pace from skill level.
 *
 * @param skillLevel - Student's self-assessed skill level (1-5)
 * @returns Pace: 'slow', 'moderate', or 'fast'
 */
function determineLearningPace(
  skillLevel: number,
): "slow" | "moderate" | "fast" {
  if (skillLevel === 1) return "slow";
  if (skillLevel === 3) return "fast";
  return "moderate";
}

/**
 * Gets session duration, using CSV value if available, otherwise default.
 *
 * @param setType - Type of session (LEARNING_SET, QUIZ, etc.)
 * @param csvDuration - Duration from database (if available)
 * @returns Duration in minutes
 */
export function getSessionDuration(
  setType: string,
  csvDuration?: number,
): number {
  // Use CSV duration if valid
  if (csvDuration && csvDuration > 0) {
    return csvDuration;
  }

  // Fall back to default based on set type
  return DEFAULT_DURATIONS[setType] || 15;
}

/**
 * Adjusts session duration based on learning pace.
 *
 * @param duration - Base duration in minutes
 * @param pace - Learning pace (slow/moderate/fast)
 * @returns Adjusted duration in minutes
 */
export function adjustDurationForPace(
  duration: number,
  pace: "slow" | "moderate" | "fast",
): number {
  const multiplier = PACE_MULTIPLIERS[pace];
  return Math.ceil(duration * multiplier);
}

/**
 * Processes sessions with pace adjustment.
 *
 * @param sessions - Array of sessions
 * @param pace - Learning pace
 * @returns Sessions with adjusted durations
 */
export function processSessionsWithPace(
  sessions: PathSession[],
  pace: "slow" | "moderate" | "fast",
): PathSession[] {
  return sessions.map((session) => {
    const baseDuration = getSessionDuration(
      session.setType || "LEARNING_SET",
      session.durationMins,
    );
    const adjustedDuration = adjustDurationForPace(baseDuration, pace);

    return {
      ...session,
      durationMins: adjustedDuration,
    };
  });
}

// =============================================================================
// MAIN FUNCTION - Generate Learning Path
// =============================================================================

/**
 * Generates a personalized learning path (client-side fallback).
 *
 * This function runs when the backend API is unavailable.
 * It uses predefined topic estimates instead of actual curriculum data.
 *
 * @param data - Complete student data (profile, goals, availability)
 * @returns Learning path with weekly modules
 *
 * @example
 * const path = generateLearningPath({
 *   profile: { name: 'John', year: '2nd', ... },
 *   goals: { targetStack: 'fullstack', ... },
 *   availability: { weekdayHours: 2, weekendHours: 4, ... }
 * });
 */
export function generateLearningPath(data: StudentData): LearningPathData {
  // -------------------------------------------------------------------------
  // STEP 1: Calculate base parameters
  // -------------------------------------------------------------------------

  const program = determineProgram(data);
  const programMultiplier = PROGRAM_MULTIPLIERS[program];
  const pace = determineLearningPace(data.goals.currentSkillLevel);
  const paceMultiplier = PACE_MULTIPLIERS[pace];

  // Calculate weekly study hours
  const weeklyHours =
    data.availability.weekdayHours * 5 + data.availability.weekendHours * 2;

  // -------------------------------------------------------------------------
  // STEP 2: Determine plan duration
  // -------------------------------------------------------------------------

  const DURATION_WEEKS: Record<string, number> = {
    "1-week": 1,
    "2-week": 2,
    "3-week": 3,
    "1-month": 4,
    "2-month": 8,
  };

  const maxWeeks = DURATION_WEEKS[data.availability.planDuration] || 4;
  const totalAvailableHours = weeklyHours * maxWeeks;

  // We'll also compute an effective weekly budget later to spread content
  // evenly across maxWeeks (prevents greedy packing into week 1).

  // -------------------------------------------------------------------------
  // STEP 3: Build topic list based on available hours
  // -------------------------------------------------------------------------

  const targetStack = data.goals.targetStack || "fullstack";
  const allTopicIds =
    LEARNING_TRACKS[targetStack] || LEARNING_TRACKS["fullstack"];

  // Add topics until we fill the available hours
  let filledHours = 0;
  const selectedTopics: string[] = [];

  for (const topicId of allTopicIds) {
    const topic = TOPIC_DEFINITIONS[topicId];
    if (!topic) continue;

    selectedTopics.push(topicId);

    // Apply both program and pace multipliers
    filledHours += Math.ceil(topic.hours * programMultiplier * paceMultiplier);

    if (filledHours >= totalAvailableHours) break;
  }

  // -------------------------------------------------------------------------
  // STEP 4: Create modules from topics
  // -------------------------------------------------------------------------

  const modules: PathModule[] = selectedTopics
    .map((topicId, index) => {
      const topic = TOPIC_DEFINITIONS[topicId];
      if (!topic) return null;

      // Apply multipliers to get adjusted hours
      const adjustedHours = Math.ceil(
        topic.hours * programMultiplier * paceMultiplier,
      );
      const weeksNeeded = Math.max(
        1,
        Math.ceil(adjustedHours / Math.max(1, weeklyHours)),
      );

      return {
        id: `mod-${index + 1}`,
        name: `Module ${index + 1}`,
        topic: topic.name,
        hoursRequired: adjustedHours,
        weeksAllocated: weeksNeeded,
        description: topic.description,
        status: index === 0 ? "current" : "upcoming",
      } as PathModule;
    })
    .filter(Boolean) as PathModule[];

  // Spread weeks evenly across maxWeeks so the plan fills the requested
  // duration instead of compressing everything into the minimum weeks.
  const rawTotalWeeks = modules.reduce((s, m) => s + m.weeksAllocated, 0);
  if (rawTotalWeeks < maxWeeks && modules.length > 0) {
    // Distribute extra weeks proportionally across modules
    const extraWeeks = maxWeeks - rawTotalWeeks;
    const perModule = Math.floor(extraWeeks / modules.length);
    let remainder = extraWeeks - perModule * modules.length;
    for (const mod of modules) {
      mod.weeksAllocated += perModule;
      if (remainder > 0) {
        mod.weeksAllocated += 1;
        remainder--;
      }
    }
  }

  // -------------------------------------------------------------------------
  // STEP 5: Calculate totals and return
  // -------------------------------------------------------------------------

  const totalWeeks = modules.reduce((sum, m) => sum + m.weeksAllocated, 0);

  return {
    student: data,
    program,
    modules,
    totalWeeks,
    weeklyHours,
  };
}
