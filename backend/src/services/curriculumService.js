/**
 * ============================================================================
 * CURRICULUM SERVICE - Business Logic Layer
 * ============================================================================
 *
 * This service handles curriculum data operations:
 * - Fetching available courses
 * - Getting topics for a course (in correct learning order)
 * - Getting sessions for a course (properly sorted)
 *
 * KEY CONCEPTS:
 * - Topic Order: Each course has a predefined topic sequence
 * - Session Order: Within topics, sessions follow a specific pattern
 * - Default Durations: Sessions without duration get type-based defaults
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import Curriculum from "../models/Curriculum.js";

// =============================================================================
// CONFIGURATION - Default Session Durations
// =============================================================================

/**
 * DEFAULT DURATIONS BY SET TYPE (in minutes)
 *
 * Used when the curriculum CSV doesn't provide a duration.
 * These are based on typical time requirements for each activity type.
 */
const DEFAULT_DURATIONS = {
  LEARNING_SET: 18, // Share sheets: 15-20 mins (avg 18)
  PRACTICE: 60, // Coding practice: 1 hour (priority activity)
  QUESTION_SET: 60, // Coding questions: 1 hour
  QUIZ: 12, // MCQs: 10-15 mins (avg 12)
  EXAM: 15, // MCQ Exams: 10-15 mins
  ASSESSMENT: 30, // Assessments: 30 mins
  PROJECT: 120, // Projects: 2 hours
};

// =============================================================================
// CONFIGURATION - Topic Order Definitions
// =============================================================================

/**
 * TOPIC ORDER BY COURSE
 *
 * This defines the correct sequence of topics within each course.
 * The order is based on the actual CCBP curriculum learning path.
 * Topics should be studied in this order for best comprehension.
 */
const TOPIC_ORDER_BY_COURSE = {
  // === DSA COURSES ===
  "Phase 1 : Data Structures and Algorithms": [
    "Importance of Data Structures and Algorithms",
    "C++ Basics",
    "Patterns",
    "Complexity Analysis",
    "C++ STL",
    "Math Basics",
    "Recursion",
    "Pseudo Code",
    "Sorting",
    "Arrays",
    "Advanced Recursion",
    "Binary Search",
    "Dynamic Programming",
    "Linked List",
    "Binary Trees",
    "Graphs",
  ],
  "Phase 2 : Advanced DSA": [
    "Graphs",
    "Binary Tree",
    "Binary Search Tree",
    "Linked List",
    "Arrays",
    "Bit Manipulation",
    "Stacks & Queues",
    "Strings",
    "Hashing",
    "Sliding Window & Two Pointer",
    "Greedy Algorithms",
    "Heaps",
    "Dynamic Programming",
    "Trie",
    "Course Exam",
  ],

  // === FRONTEND COURSES ===
  "Build Your Own Static Website": [
    "Introduction to HTML",
    "HTML Hyperlinks",
    "Introduction to HTML5 & HTML Semantic Elements",
    "Introduction to CSS",
    "Intro to CSS & CSS Box Model",
    "CSS Box Model & Intro to Bootstrap",
    "Introduction to Bootstrap & Developing Layouts",
    "Developing Layouts",
    "Website Integration",
    "Industry Readiness",
    "Revision",
    "Build Your Own Static Website Course Quiz",
  ],
  "Build Your Own Responsive Website": [
    "Responsive Web Design & Bootstrap Grid System",
    "CSS Selectors and Inheritance",
    "CSS Specificity and Cascade & Developing Layouts",
    "CSS Gradients and Transitions",
    "CSS Transforms and Animations",
    "Bootstrap Grid System and Navbar",
    "Developing Layouts 2",
    "Developing Layouts 3",
    "Industry Readiness",
    "Revision",
    "Build Your Own Responsive Website Course Quiz",
  ],
  "Modern Responsive Web Design": [
    "Sizing Elements and Box Sizing",
    "Introduction to CSS Flexbox",
    "CSS Flexbox & Media Queries",
    "Flexbox Sizing",
    "CSS Positioning | Part I and Part II",
    "CSS Grid | Part I and Part II",
    "CSS Grid | Part III and Part IV",
    "Introduction to Tailwind CSS |  Part I and Part II",
    "Building a Responsive Website with Tailwind CSS",
    "Revision",
    "Modern Responsive Web Design Course Quiz",
  ],

  // === PROGRAMMING FOUNDATIONS ===
  "Programming Foundations": [
    "Introduction to Python",
    "Sequence of Instructions",
    "Type Conversions",
    "Logical Operators & Conditonal Statements",
    "Nested Conditional Statements & Loops",
    "For Loop",
    "Nested Loops & Problem Solving",
    "Loop Control Statements & Problem Solving",
    "Comparing Strings & Naming Variables",
    "Lists",
    "Lists - 2",
    "List Methods and Tuples",
    "Nested Lists and String Formatting",
    "Sets and Set Operations",
    "Dictionaries",
    "Functions",
    "Scopes and Python Libraries",
    "Built-in Functions & Recursions",
    "Problem Solving using Recursion",
    "Understanding OOPs",
    "Object Oriented Programming",
    "Encapsulation and Inheritance",
    "Abstraction and Polymorphism",
    "Error Handling and DateTime",
    "Intro to Matrices & Shorthand expressions",
    "String Methods & Problem Solving and Debugging - 3",
    "More Python Concepts",
    "Problem Solving",
    "Problem Solving and Debugging",
    "Problem Solving and Built-in Functions",
    "Understanding Coding Question Formats",
    "Revision",
    "Programming Foundations Course Quiz",
  ],

  // === JAVASCRIPT & DYNAMIC WEB ===
  "JS Essentials": [
    "More JS Concepts",
    "More JS Concepts II",
    "JS Classes & Promises",
    "More Modern JS Concepts",
    "More Modern JS Concepts II",
    "More Modern JS Concepts III",
    "Revision",
  ],
  "Build Your Own Dynamic Web Application": [
    "Introduction to Dynamic Web Applications",
    "Introduction to JS & Variables",
    "Arrays & Objects",
    "Forms",
    "Fetch & Callbacks",
    "Fetch & Callbacks 2",
    "Fetch & Callbacks 3",
    "More Web Concepts",
    "Revision",
  ],

  // === DATABASE ===
  "Introduction to Databases": [
    "Introduction to Database",
    "Introduction To SQL",
    "Querying with SQL",
    "Querying with SQL - 2",
    "Aggregations and Group By",
    "Group By with Having",
    "SQL Expressions and Functions",
    "SQL Case Clause and Set Operations",
    "Modelling Databases",
    "Joins",
    "Querying with Joins",
    "Views and Subqueries",
    "SQL Course Quiz",
  ],

  // === BACKEND ===
  "Node JS": [
    "MERN Stack and CCBP IDE",
    "Introduction to Node JS",
    "Introduction to Express JS",
    "Introduction to Express JS - 2",
    "REST APIs and Debugging",
    "Authentication",
    "Course Quiz",
  ],
  MongoDB: ["Introduction to MongoDB"],

  // === REACT ===
  "Introduction to React JS": [
    "Introduction to React JS and States",
    "Introduction to State Hook",
    "Effect Hook and Rules of Hooks",
    "Routing using React Router",
    "React Context",
    "Authentication & Authorization",
    "Course Quiz",
  ],

  // === AI/ML COURSES ===
  "Generative AI": [
    "Course Overview",
    "Introduction to Generative AI and AI Workflows",
    "Advanced Gen AI Capabilities",
    "Productivity Power-Up with AI Tools & Prompt Engineering Fundamentals",
    "No-Code AI Automation",
    "AI Workflows for Enhanced Productivity",
    "Mastering Image Generation",
    "Mastering Audio Generation & No-Code Application Building",
    "Building AI Agents",
    "Building an AI Shopping Assistant",
    "Agents with Memory & Introduction to MCP",
  ],
  "Building LLM Applications": [
    "Course Overview",
    "Building LLM Applications Using Python",
    "Building UI and Deploying LLM Applications",
    "Understanding How LLMs Works & Enhancing Productivity with AI",
    "Tools Use & Function Calling in LLMs",
    "Introduction to LangChain and Retrieval-Augmented Generation (RAG)",
    "Building AI Agents Using LangChain and Memory Agents",
    "Building AI-Powered Conversational Interview Assistant and RAG Agent Using LangChain",
    "Introduction to Context Engineering and MCP",
    "Building Multi Agent Systems and LLM Evaluation",
    "Agent Evaluation and End-to-End AI Systems",
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets the order index of a topic within a course.
 *
 * Used for sorting topics in the correct learning sequence.
 * Returns 999 for unknown topics (places them at the end).
 *
 * @param {string} courseName - The course name
 * @param {string} topic - The topic name to find
 * @returns {number} - The order index (0-based), or 999 if not found
 */
function getTopicOrderIndex(courseName, topic) {
  const courseTopics = TOPIC_ORDER_BY_COURSE[courseName];

  if (!courseTopics) {
    return 999; // Unknown course
  }

  const topicLower = (topic || "").toLowerCase();

  // Find matching topic (with fuzzy matching)
  const index = courseTopics.findIndex((t) => {
    const definedTopicLower = t.toLowerCase();
    return (
      definedTopicLower === topicLower ||
      topicLower.includes(definedTopicLower) ||
      definedTopicLower.includes(topicLower)
    );
  });

  return index >= 0 ? index : 999;
}

/**
 * Gets the order of a session within its topic based on session name patterns.
 *
 * Sessions within a topic follow a specific learning sequence:
 * 1. Main content/video
 * 2. Reading material
 * 3. Cheat sheet
 * 4. Classroom quizzes (A, B, C)
 * 5. MCQ practice
 * 6. Coding practice
 * 7. Daily quiz
 *
 * @param {string} sessionName - The session name
 * @returns {number} - The order priority (lower = earlier)
 */
function getSessionOrderWithinTopic(sessionName) {
  const nameLower = (sessionName || "").toLowerCase();

  // Main topic video/content comes first (no special markers)
  const isSpecialSession =
    nameLower.includes("|") ||
    nameLower.includes("reading material") ||
    nameLower.includes("quiz") ||
    nameLower.includes("practice") ||
    nameLower.includes("coding") ||
    nameLower.includes("mcq") ||
    nameLower.includes("daily") ||
    nameLower.includes("classroom");

  if (!isSpecialSession) return 0;

  // Order by session type
  if (nameLower.includes("reading material")) return 1;
  if (nameLower.includes("cheat sheet")) return 2;
  if (nameLower.includes("classroom quiz a")) return 3;
  if (nameLower.includes("classroom quiz b")) return 4;
  if (nameLower.includes("classroom quiz c")) return 5;
  if (nameLower.includes("mcq practice")) return 6;
  if (nameLower.includes("coding practice")) return 7;
  if (nameLower.includes("daily quiz")) return 8;
  if (nameLower.includes("quiz")) return 9;
  if (nameLower.includes("practice")) return 10;

  return 50; // Unknown patterns go to the middle
}

/**
 * Applies default duration to a session if not provided.
 *
 * @param {Object} session - The session object
 * @returns {Object} - Session with duration applied
 */
function applyDefaultDuration(session) {
  if (!session.durationMins || session.durationMins <= 0) {
    const setType = session.setType || "LEARNING_SET";
    session.durationMins = DEFAULT_DURATIONS[setType] || 15;
  }
  return session;
}

// =============================================================================
// MAIN SERVICE METHODS
// =============================================================================

/**
 * Gets all unique course names from the curriculum.
 *
 * @returns {Promise<string[]>} - Array of course names
 */
export async function getAllCourses() {
  return Curriculum.distinct("courseName");
}

/**
 * Gets all topics for a specific course, sorted in correct learning order.
 *
 * @param {string} courseName - The course name
 * @returns {Promise<string[]>} - Array of topic names (sorted)
 */
export async function getTopicsForCourse(courseName) {
  const topics = await Curriculum.distinct("topic", { courseName });

  // Sort topics according to predefined order
  return topics.sort((a, b) => {
    const orderA = getTopicOrderIndex(courseName, a);
    const orderB = getTopicOrderIndex(courseName, b);
    return orderA - orderB;
  });
}

/**
 * Gets all sessions for a specific course, sorted in correct learning order.
 *
 * Sorting is done by:
 * 1. Topic order (as defined in TOPIC_ORDER_BY_COURSE)
 * 2. Session type within topic (main content → reading → quizzes → practice)
 * 3. Sequence number (as tiebreaker)
 *
 * @param {string} courseName - The course name
 * @returns {Promise<Object[]>} - Array of session objects (sorted, with durations)
 */
export async function getSessionsForCourse(courseName) {
  const sessions = await Curriculum.find({ courseName }).sort({
    sequenceNumber: 1,
  });

  // Apply default durations and convert to plain objects
  const sessionsWithDurations = sessions.map((session) => {
    const sessionObj = session.toObject();
    return applyDefaultDuration(sessionObj);
  });

  // Sort by topic order, then by session pattern within topic
  return sessionsWithDurations.sort((a, b) => {
    // First, sort by topic order
    const topicOrderA = getTopicOrderIndex(courseName, a.topic);
    const topicOrderB = getTopicOrderIndex(courseName, b.topic);

    if (topicOrderA !== topicOrderB) {
      return topicOrderA - topicOrderB;
    }

    // Within same topic, sort by session pattern
    const sessionOrderA = getSessionOrderWithinTopic(a.sessionName);
    const sessionOrderB = getSessionOrderWithinTopic(b.sessionName);

    if (sessionOrderA !== sessionOrderB) {
      return sessionOrderA - sessionOrderB;
    }

    // Tiebreaker: use sequence number from CSV
    return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
  });
}
