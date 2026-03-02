/**
 * ============================================================================
 * STUDENT SERVICE - Business Logic Layer
 * ============================================================================
 *
 * This service handles all student-related business logic:
 * - Student profile management (CRUD operations)
 * - Learning path generation algorithm
 * - Track progression and recommendations
 *
 * KEY CONCEPTS:
 * - Learning Tracks: Predefined sequences of courses (frontend, backend, etc.)
 * - Learning Pace: Adjusts session durations based on skill level
 * - Program Types: basic/academy/intensive with different time multipliers
 * - Weekly Planning: Distributes sessions across weeks based on availability
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import StudentData from "../models/StudentData.js";
import Curriculum from "../models/Curriculum.js";

// =============================================================================
// CONFIGURATION - Learning Track Definitions
// =============================================================================

/**
 * LEARNING TRACKS
 *
 * Each track defines the sequence of courses a student should follow.
 * The order matters! Static → Responsive → Python → JavaScript → SQL → Node JS
 * is the recommended full-stack learning path.
 */
const LEARNING_TRACKS = {
  frontend: [
    "Build Your Own Static Website",
    "Build Your Own Responsive Website",
    "Modern Responsive Web Design",
    "JS Essentials",
    "Build Your Own Dynamic Web Application",
    "Introduction to React JS",
  ],
  backend: [
    "Programming Foundations",
    "JS Essentials",
    "Introduction to Databases",
    "Node JS",
    "MongoDB",
  ],
  fullstack: [
    "Build Your Own Static Website",
    "Build Your Own Responsive Website",
    "Modern Responsive Web Design",
    "Programming Foundations",
    "Python for DSML",
    "JS Essentials",
    "Build Your Own Dynamic Web Application",
    "Introduction to Databases",
    "Node JS",
    "Introduction to React JS",
    "MongoDB",
  ],
  "ai-ml": [
    "Programming Foundations",
    "Python for DSML",
    "Linux and Git Essentials",
    "Data Analytics Foundations",
    "Introduction to ML and Classification Algorithms",
    "Supervised Learning: Regression",
    "Generative AI",
    "Building LLM Applications",
  ],
  dsa: [
    "Programming Foundations",
    "JS Essentials",
    "DSA Foundation",
    "Phase 1 : Data Structures and Algorithms",
    "Phase 2 : Advanced DSA",
  ],
  sql: [
    "Programming Foundations",
    "Introduction to Databases",
    "Data Analytics Foundations",
  ],
  python: [
    "Programming Foundations",
    "Python for DSML",
    "Data Analytics Foundations",
  ],
};

/**
 * PROGRAM MULTIPLIERS
 *
 * Different programs have different pacing:
 * - Basic (1.3x): More time per topic for beginners or students with backlogs
 * - Academy (1.0x): Standard pace for average learners
 * - Intensive (0.7x): Faster pace for advanced students
 */
const PROGRAM_MULTIPLIERS = {
  basic: 1.3,
  academy: 1.0,
  intensive: 0.7,
};

/**
 * LEARNING PACE SETTINGS
 *
 * Session durations are adjusted based on the student's skill level.
 * Slower learners get more time for review materials, quizzes, etc.
 */
const LEARNING_PACE = {
  slow: {
    cheatSheetMinutes: 60, // Time for reading/revision materials
    learningSetMinutes: 45, // Time for learning modules
    quizMinutes: 20, // Time for quizzes
  },
  moderate: {
    cheatSheetMinutes: 40,
    learningSetMinutes: 35,
    quizMinutes: 15,
  },
  fast: {
    cheatSheetMinutes: 25,
    learningSetMinutes: 25,
    quizMinutes: 10,
  },
};

/**
 * PLAN DURATION MAPPING
 *
 * Converts user-friendly duration strings to number of weeks.
 */
const PLAN_DURATIONS_IN_WEEKS = {
  "1-week": 1,
  "2-week": 2,
  "3-week": 3,
  "4-week": 4,
  "1-month": 4,
  "2-month": 8,
};

/**
 * TRACK CONTINUATION COURSES
 *
 * When a student finishes their chosen track, these are the recommended
 * next courses to continue their learning journey.
 */
const TRACK_CONTINUATION = {
  python: [
    "JS Essentials",
    "Introduction to Databases",
    "Data Analytics Foundations",
  ],
  sql: ["Python for DSML", "Data Analytics Foundations", "JS Essentials"],
  frontend: [
    "Programming Foundations",
    "Introduction to Databases",
    "Node JS",
    "MongoDB",
  ],
  backend: [
    "Build Your Own Static Website",
    "Build Your Own Responsive Website",
    "Introduction to React JS",
  ],
  dsa: ["Python for DSML", "Introduction to Databases", "Node JS"],
  "ai-ml": ["Introduction to Databases", "JS Essentials", "Node JS"],
  fullstack: [],
};

/**
 * TRACK NAMES (Human-readable)
 */
const TRACK_DISPLAY_NAMES = {
  backend: "Backend Development",
  frontend: "Frontend Development",
  fullstack: "Full Stack Development",
  "ai-ml": "AI/ML Engineering",
  dsa: "Data Structures & Algorithms",
  sql: "SQL & Databases",
  python: "Python Programming",
};

/**
 * NEXT TRACK SUGGESTIONS
 *
 * After completing a track, this defines what to recommend next.
 */
const TRACK_COMPLETION_SUGGESTIONS = {
  backend: {
    nextTrack: "frontend",
    message:
      "🎉 Congratulations! You've completed all Backend technologies! You can now move to Frontend Development to become a Full Stack Developer.",
    suggestedCourses: [
      "Build Your Own Static Website",
      "Build Your Own Responsive Website",
      "Introduction to React JS",
    ],
  },
  frontend: {
    nextTrack: "backend",
    message:
      "🎉 Congratulations! You've mastered Frontend Development! Consider moving to Backend Development to become a Full Stack Developer.",
    suggestedCourses: [
      "Programming Foundations",
      "Introduction to Databases",
      "Node JS",
      "MongoDB",
    ],
  },
  sql: {
    nextTrack: "backend",
    message:
      "🎉 Congratulations! You've completed SQL & Databases! You can now explore Backend Development or Data Analytics.",
    suggestedCourses: ["Node JS", "MongoDB", "Data Analytics Foundations"],
  },
  python: {
    nextTrack: "ai-ml",
    message:
      "🎉 Congratulations! You've completed Python Programming! Consider exploring AI/ML or Data Science next.",
    suggestedCourses: [
      "Data Analytics Foundations",
      "Introduction to ML and Classification Algorithms",
    ],
  },
  dsa: {
    nextTrack: "fullstack",
    message:
      "🎉 Congratulations! You've mastered DSA! You're now ready to build complete applications. Consider Full Stack Development.",
    suggestedCourses: ["Introduction to React JS", "Node JS", "MongoDB"],
  },
  "ai-ml": {
    nextTrack: "fullstack",
    message:
      "🎉 Congratulations! You've completed AI/ML track! Consider learning Full Stack to build end-to-end ML applications.",
    suggestedCourses: [
      "Build Your Own Dynamic Web Application",
      "Node JS",
      "Introduction to React JS",
    ],
  },
  fullstack: {
    nextTrack: null,
    message:
      "🏆 Amazing! You've completed the entire Full Stack track! You're now a well-rounded developer ready for any challenge!",
    suggestedCourses: [],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determines the program type based on student's profile and goals.
 *
 * RULES:
 * - Skill level 1-2 OR has backlogs → Basic (slower pace)
 * - Skill level 4-5 → Intensive (faster pace)
 * - Otherwise → Academy (standard pace)
 *
 * @param {Object} studentData - Student profile and goals
 * @returns {'basic' | 'academy' | 'intensive'} - The program type
 */
function determineProgram(studentData) {
  const skillLevel = studentData.goals.currentSkillLevel;
  const hasBacklogs = studentData.profile.hasBacklogs;

  if (skillLevel <= 2 || hasBacklogs) return "basic";
  if (skillLevel >= 4) return "intensive";
  return "academy";
}

/**
 * Determines learning pace based on skill level.
 *
 * @param {number} skillLevel - Student's skill level (1-5)
 * @returns {'slow' | 'moderate' | 'fast'} - The learning pace
 */
function determineLearningPace(skillLevel) {
  if (skillLevel <= 2) return "slow";
  if (skillLevel >= 4) return "fast";
  return "moderate";
}

/**
 * Calculates total weekly study hours from daily availability.
 *
 * @param {Object} availability - Student's weekly availability
 * @returns {number} - Total hours per week
 */
function calculateWeeklyHours(availability) {
  const weekdayHours = availability.weekdayHours * 5; // 5 weekdays
  const weekendHours = availability.weekendHours * 2; // 2 weekend days
  return weekdayHours + weekendHours;
}

/**
 * Gets session duration based on session type and learning pace.
 *
 * Different session types have different default durations:
 * - Cheat sheets/Reading materials: Based on learning pace
 * - Coding practice: 60 minutes (fixed, priority activity)
 * - Quizzes: Based on learning pace
 * - Learning sets: Based on learning pace
 *
 * @param {Object} session - The curriculum session
 * @param {Object} paceSettings - Duration settings for current pace
 * @returns {number} - Duration in minutes
 */
function calculateSessionDuration(session, paceSettings) {
  const sessionName = (session.sessionName || "").toLowerCase();
  const setType = (session.setType || "").toLowerCase();

  // If CSV has valid duration, use it (unless it's a cheat sheet)
  let duration = parseInt(session.duration, 10);

  // Check if it's a reading/review material
  const isReadingMaterial =
    sessionName.includes("cheat sheet") ||
    sessionName.includes("cheatsheet") ||
    sessionName.includes("reading material");

  if (isReadingMaterial) {
    // Always use pace-based duration for reading materials
    return paceSettings.cheatSheetMinutes;
  }

  if (isNaN(duration) || duration <= 0) {
    // Determine duration based on session type
    if (
      sessionName.includes("coding practice") ||
      setType.includes("coding") ||
      setType.includes("practice")
    ) {
      return 60; // Coding practice: 1 hour
    }
    if (
      sessionName.includes("mcq") ||
      setType.includes("quiz") ||
      sessionName.includes("quiz")
    ) {
      return paceSettings.quizMinutes;
    }
    if (setType.includes("learning_set") || sessionName.includes("learning")) {
      return paceSettings.learningSetMinutes;
    }
    return 30; // Default for unknown types
  }

  return duration;
}

/**
 * Generates a creative, concise title for a weekly sprint module.
 *
 * Instead of listing all topics, this creates a thematic title
 * based on the content being covered that week.
 *
 * @param {Set<string>} weekTopics - Set of topic names for the week
 * @param {number} weekNumber - The week number
 * @returns {string} - A descriptive sprint title
 */
function generateSprintTitle(weekTopics, weekNumber) {
  const topics = Array.from(weekTopics);

  // Simple cases
  if (topics.length === 0) return `Week ${weekNumber} Sprint`;
  if (topics.length === 1) return topics[0];
  if (topics.length === 2) return `${topics[0]} & ${topics[1]}`;

  // Detect themes from topic keywords
  const joinedTopics = topics.join(" ").toLowerCase();
  const detectedThemes = [];

  // Theme detection rules
  const themeRules = [
    { keywords: ["introduction", "intro"], theme: "Foundations" },
    {
      keywords: [
        "oop",
        "object oriented",
        "abstraction",
        "polymorphism",
        "inheritance",
      ],
      theme: "OOP Concepts",
    },
    {
      keywords: ["function", "recursion", "scope", "built-in"],
      theme: "Functions & Logic",
    },
    {
      keywords: ["list", "matri", "nested", "data structure"],
      theme: "Data Structures",
    },
    { keywords: ["loop", "conditional", "control"], theme: "Control Flow" },
    {
      keywords: ["string", "variable", "type", "conversion"],
      theme: "Core Syntax",
    },
    {
      keywords: ["html", "css", "web", "responsive"],
      theme: "Web Fundamentals",
    },
    { keywords: ["javascript", "js", "dom", "event"], theme: "JavaScript" },
    { keywords: ["react", "component", "hook", "state"], theme: "React" },
    { keywords: ["api", "http", "fetch", "rest"], theme: "APIs & Networking" },
    {
      keywords: ["sql", "database", "query", "table"],
      theme: "Databases & SQL",
    },
    {
      keywords: ["node", "express", "server", "middleware"],
      theme: "Backend & Node.js",
    },
    { keywords: ["mongo", "crud", "aggregat"], theme: "MongoDB" },
    { keywords: ["git", "linux", "terminal", "cli"], theme: "Dev Tools & Git" },
    { keywords: ["ai", "ml", "model", "genai", "llm"], theme: "AI & ML" },
    { keywords: ["dsa", "sorting", "search", "tree", "graph"], theme: "DSA" },
  ];

  for (const rule of themeRules) {
    if (rule.keywords.some((keyword) => joinedTopics.includes(keyword))) {
      detectedThemes.push(rule.theme);
    }
  }

  // Remove duplicates
  const uniqueThemes = [...new Set(detectedThemes)];

  // Build title from themes
  if (uniqueThemes.length >= 2) {
    return `${uniqueThemes[0]}, ${uniqueThemes[1]} & More`;
  }
  if (uniqueThemes.length === 1) {
    return `${uniqueThemes[0]} & ${topics.length} Topics`;
  }

  // Fallback
  return `${topics[0]} & ${topics.length - 1} More Topics`;
}

/**
 * Generates a descriptive summary for a week's sessions.
 *
 * @param {Array} sessions - Array of sessions in the week
 * @param {Set<string>} topics - Set of topic names
 * @returns {string} - A human-readable description
 */
function generateSprintDescription(sessions, topics) {
  const topicList = Array.from(topics);
  const sampleTopics = topicList.slice(0, 3).join(", ");
  const extraCount =
    topicList.length > 3 ? ` and ${topicList.length - 3} more` : "";

  return `Covers ${sessions.length} sessions across ${topicList.length} topics including ${sampleTopics}${extraCount}.`;
}

// =============================================================================
// MAIN SERVICE METHODS
// =============================================================================

/**
 * Gets the student data for a specific user.
 *
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} - Student profile, goals, and availability
 * @throws {Error} - If student data not found
 */
export async function getStudentData(userId) {
  const studentData = await StudentData.findOne({ user: userId });

  if (!studentData) {
    throw new Error("Student data not found");
  }

  return studentData;
}

/**
 * Creates initial student data during onboarding.
 *
 * @param {string} userId - The authenticated user's ID
 * @param {Object} data - Student profile, goals, and availability
 * @returns {Promise<Object>} - The created student data
 * @throws {Error} - If data already exists
 */
export async function createStudentData(
  userId,
  { profile, goals, availability },
) {
  // Check for existing data
  const existingData = await StudentData.findOne({ user: userId });
  if (existingData) {
    throw new Error("Student data already exists. Use PUT to update.");
  }

  // Create new student data
  const studentData = await StudentData.create({
    user: userId,
    profile,
    goals,
    availability,
  });

  return studentData;
}

/**
 * Updates existing student data.
 *
 * @param {string} userId - The authenticated user's ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - The updated student data
 * @throws {Error} - If student data not found
 */
export async function updateStudentData(
  userId,
  { profile, goals, availability },
) {
  const studentData = await StudentData.findOne({ user: userId });

  if (!studentData) {
    throw new Error("Student data not found");
  }

  // Apply updates (keep existing values if not provided)
  studentData.profile = profile || studentData.profile;
  studentData.goals = goals || studentData.goals;
  studentData.availability = availability || studentData.availability;

  return studentData.save();
}

/**
 * Generates a personalized learning path based on student data.
 *
 * This is the CORE ALGORITHM of the Student Accelerator system.
 *
 * ALGORITHM OVERVIEW:
 * 1. Determine program type (basic/academy/intensive) based on skill level
 * 2. Calculate weekly study hours from availability
 * 3. Determine learning pace for session duration adjustments
 * 4. Fetch curriculum items for the student's chosen track
 * 5. Distribute sessions across weeks based on available time
 * 6. Generate suggestions for continued learning
 *
 * @param {Object} studentData - Complete student profile
 * @returns {Promise<Object>} - The generated learning path with weekly modules
 */
export async function generateLearningPath({ profile, goals, availability }) {
  // -------------------------------------------------------------------------
  // STEP 1: Calculate base parameters
  // -------------------------------------------------------------------------

  const program = determineProgram({ profile, goals, availability });
  const programMultiplier = PROGRAM_MULTIPLIERS[program];
  const learningPace = determineLearningPace(goals.currentSkillLevel);
  const paceSettings = LEARNING_PACE[learningPace];
  const weeklyHours = calculateWeeklyHours(availability);
  const weeklyMinutesLimit = weeklyHours * 60;

  // Get plan duration in weeks
  const maxWeeks = PLAN_DURATIONS_IN_WEEKS[availability.planDuration] || 1;
  const totalAvailableMinutes = weeklyMinutesLimit * maxWeeks;

  // -------------------------------------------------------------------------
  // STEP 2: Determine courses to fetch
  // -------------------------------------------------------------------------

  const targetStack = goals.targetStack || "fullstack";
  const trackCourses =
    LEARNING_TRACKS[targetStack] || LEARNING_TRACKS["fullstack"];

  // -------------------------------------------------------------------------
  // STEP 3: Fetch curriculum items (with deduplication)
  // -------------------------------------------------------------------------

  const processedIds = new Set(); // Track processed items to prevent duplicates
  let curriculumItems = [];
  const courseMapping = []; // Maps each item to its course

  /**
   * Helper function to fetch and append course items.
   * Returns the total minutes added.
   */
  async function fetchAndAppendCourse(courseName) {
    const items = await Curriculum.find({ courseName }).sort({
      sequenceNumber: 1,
    });
    let addedMinutes = 0;

    for (const item of items) {
      const itemId = item._id.toString();

      // Skip duplicates
      if (processedIds.has(itemId)) continue;

      processedIds.add(itemId);
      curriculumItems.push(item);
      courseMapping.push(courseName);

      // Calculate duration
      let duration = parseInt(item.duration, 10);
      if (isNaN(duration) || duration === 0) duration = 45;
      addedMinutes += Math.ceil(duration * programMultiplier);
    }

    return addedMinutes;
  }

  let filledMinutes = 0;

  // If a specific course is selected, start from there
  if (goals.courseName && goals.courseName !== "all") {
    filledMinutes += await fetchAndAppendCourse(goals.courseName);

    // Continue with subsequent courses in the track
    if (filledMinutes < totalAvailableMinutes) {
      const courseIndex = trackCourses.indexOf(goals.courseName);
      const remainingCourses =
        courseIndex !== -1
          ? trackCourses.slice(courseIndex + 1)
          : trackCourses.filter((c) => c !== goals.courseName);

      for (const course of remainingCourses) {
        if (filledMinutes >= totalAvailableMinutes) break;
        filledMinutes += await fetchAndAppendCourse(course);
      }
    }
  } else {
    // Fetch all courses in the track
    for (const courseName of trackCourses) {
      filledMinutes += await fetchAndAppendCourse(courseName);
    }
  }

  // Add continuation courses if time remains
  if (filledMinutes < totalAvailableMinutes) {
    const continuationCourses = TRACK_CONTINUATION[targetStack] || [];
    for (const course of continuationCourses) {
      if (filledMinutes >= totalAvailableMinutes) break;
      filledMinutes += await fetchAndAppendCourse(course);
    }
  }

  // Handle case where no curriculum found
  if (curriculumItems.length === 0) {
    throw new Error("No curriculum found for the selected path.");
  }

  // -------------------------------------------------------------------------
  // STEP 4: Handle "resume from" functionality
  // -------------------------------------------------------------------------

  if (goals.lastCompletedSessionId && goals.lastCompletedSessionId !== "none") {
    const completedIndex = curriculumItems.findIndex(
      (item) => item._id.toString() === goals.lastCompletedSessionId,
    );

    if (completedIndex !== -1) {
      // Remove completed items
      curriculumItems = curriculumItems.slice(completedIndex + 1);
      courseMapping.splice(0, completedIndex + 1);
    }
  }

  // Handle empty curriculum after filtering
  if (curriculumItems.length === 0) {
    return {
      student: { profile, goals, availability },
      program,
      modules: [],
      totalWeeks: 0,
      weeklyHours,
    };
  }

  // -------------------------------------------------------------------------
  // STEP 5: Distribute sessions across weeks
  // -------------------------------------------------------------------------

  const modules = [];
  let currentWeek = 1;
  let currentWeekMinutes = 0;
  let currentSessions = [];
  let weekTopics = new Set();
  let weekCourses = new Set();

  /**
   * Finalizes the current week and creates a module.
   */
  function finalizeWeek() {
    // Detect course transitions within this week
    const courseTransitions = [];
    let previousCourse = null;

    for (const session of currentSessions) {
      if (
        previousCourse &&
        session.courseName &&
        session.courseName !== previousCourse
      ) {
        courseTransitions.push({
          completed: previousCourse,
          next: session.courseName,
          message: `🎉 You completed ${previousCourse}! Next up: ${session.courseName}`,
        });
      }
      if (session.courseName) previousCourse = session.courseName;
    }

    // Clean sessions (remove internal courseName field)
    const cleanSessions = currentSessions.map(
      ({ courseName, ...rest }) => rest,
    );

    // Create module
    const module = {
      id: `mod-week-${currentWeek}`,
      name: `Week ${currentWeek} Plan`,
      topic: generateSprintTitle(weekTopics, currentWeek),
      topicsList: Array.from(weekTopics),
      coursesInWeek: Array.from(weekCourses),
      hoursRequired: Math.round((currentWeekMinutes / 60) * 10) / 10,
      weeksAllocated: 1,
      description: generateSprintDescription(cleanSessions, weekTopics),
      status: currentWeek === 1 ? "current" : "upcoming",
      sessions: cleanSessions,
    };

    // Add course transitions if any
    if (courseTransitions.length > 0) {
      module.courseTransitions = courseTransitions;
    }

    modules.push(module);
  }

  // Process each curriculum item
  for (let i = 0; i < curriculumItems.length; i++) {
    if (currentWeek > maxWeeks) break;

    const item = curriculumItems[i];
    const itemCourse = courseMapping[i] || "";

    // Calculate duration with pace adjustment and program multiplier
    let duration = calculateSessionDuration(item, paceSettings);
    duration = Math.ceil(duration * programMultiplier);

    // Check if we need to start a new week
    if (
      currentWeekMinutes + duration > weeklyMinutesLimit &&
      currentSessions.length > 0
    ) {
      finalizeWeek();

      currentWeek++;
      if (currentWeek > maxWeeks) break;

      currentWeekMinutes = 0;
      currentSessions = [];
      weekTopics = new Set();
      weekCourses = new Set();
    }

    // Build CCBP learning portal URL
    const ccbpUrl =
      item.courseId && item.topicId && item.unitId
        ? `https://learning.ccbp.in/course?c_id=${item.courseId}&t_id=${item.topicId}&s_id=${item.unitId}`
        : null;

    // Add session to current week
    currentWeekMinutes += duration;
    currentSessions.push({
      id: item._id ? item._id.toString() : Math.random().toString(),
      topic: item.topic || "General",
      sessionName: item.sessionName || item.topic,
      durationMins: duration,
      setType: item.setType || "",
      ccbpUrl,
      courseName: itemCourse, // Internal field, will be removed before sending
    });

    weekTopics.add(item.topic || "General");
    weekCourses.add(itemCourse);
  }

  // Finalize last week if it has sessions
  if (currentWeek <= maxWeeks && currentSessions.length > 0) {
    finalizeWeek();
  }

  // -------------------------------------------------------------------------
  // STEP 6: Generate suggestions and track completion info
  // -------------------------------------------------------------------------

  const allPlannedCourses = new Set(courseMapping);
  const remainingTrackCourses = trackCourses.filter(
    (c) => !allPlannedCourses.has(c),
  );
  const continuationCourses = (TRACK_CONTINUATION[targetStack] || []).filter(
    (c) => !allPlannedCourses.has(c),
  );

  const isTrackCompleted = remainingTrackCourses.length === 0;

  let suggestion = null;
  let trackCompletion = null;

  if (isTrackCompleted) {
    // Track is fully completed!
    const trackSuggestion = TRACK_COMPLETION_SUGGESTIONS[targetStack];

    if (trackSuggestion) {
      trackCompletion = {
        completed: true,
        trackName: TRACK_DISPLAY_NAMES[targetStack] || targetStack,
        message: trackSuggestion.message,
        nextTrack: trackSuggestion.nextTrack,
        nextTrackName: trackSuggestion.nextTrack
          ? TRACK_DISPLAY_NAMES[trackSuggestion.nextTrack]
          : null,
        suggestedCourses: trackSuggestion.suggestedCourses,
      };

      // Add continuation suggestion
      if (continuationCourses.length > 0) {
        const nextTrackName =
          TRACK_DISPLAY_NAMES[trackSuggestion.nextTrack] || "the next track";
        suggestion = {
          message: `💡 Want to continue learning? You can start with "${continuationCourses[0]}" from ${nextTrackName}!`,
          nextCourse: continuationCourses[0],
        };
      }
    }
  } else {
    // Track not completed, suggest next course
    const nextCourse =
      remainingTrackCourses[0] || continuationCourses[0] || null;

    if (nextCourse) {
      suggestion = {
        message: `🚀 Great progress! After completing your current plan, you can continue with "${nextCourse}" to keep leveling up!`,
        nextCourse,
      };
    }
  }

  // -------------------------------------------------------------------------
  // STEP 7: Build and return the learning path response
  // -------------------------------------------------------------------------

  return {
    student: { profile, goals, availability },
    program,
    modules,
    totalWeeks: modules.length,
    weeklyHours,
    ...(suggestion ? { suggestion } : {}),
    ...(trackCompletion ? { trackCompletion } : {}),
  };
}
