import Curriculum from "../models/Curriculum.js";

// Default durations by Set Type (in minutes)
// Used when duration is not provided in CSV
const DEFAULT_DURATIONS = {
  LEARNING_SET: 18, // Share sheets: 15-20 mins (avg 18)
  PRACTICE: 60, // Coding: 1 hour (priority)
  QUESTION_SET: 60, // Coding questions: 1 hour
  QUIZ: 12, // MCQs: 10-15 mins (avg 12)
  EXAM: 15, // MCQ Exams: 10-15 mins
  ASSESSMENT: 30, // Assessments: 30 mins
  PROJECT: 120, // Projects: 2 hours
};

// Correct topic order for each course (based on actual CCBP curriculum order)
const TOPIC_ORDER = {
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
    "Graphs"
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
    "Course Exam"
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
    "Build Your Own Static Website Course Quiz"
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
    "Build Your Own Responsive Website Course Quiz"
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
    "Modern Responsive Web Design Course Quiz"
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
    "Programming Foundations Course Quiz"
  ],
  
  // === JAVASCRIPT & DYNAMIC WEB ===
  "JS Essentials": [
    "More JS Concepts",
    "More JS Concepts II",
    "JS Classes & Promises",
    "More Modern JS Concepts",
    "More Modern JS Concepts II",
    "More Modern JS Concepts III",
    "Revision"
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
    "Revision"
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
    "SQL Course Quiz"
  ],
  
  // === BACKEND ===
  "Node JS": [
    "MERN Stack and CCBP IDE",
    "Introduction to Node JS",
    "Introduction to Express JS",
    "Introduction to Express JS - 2",
    "REST APIs and Debugging",
    "Authentication",
    "Course Quiz"
  ],
  "MongoDB": [
    "Introduction to MongoDB"
  ],
  
  // === REACT ===
  "Introduction to React JS": [
    "Introduction to React JS and States",
    "Introduction to State Hook",
    "Effect Hook and Rules of Hooks",
    "Routing using React Router",
    "React Context",
    "Authentication & Authorization",
    "Course Quiz"
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
    "Agents with Memory & Introduction to MCP"
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
    "Agent Evaluation and End-to-End AI Systems"
  ],
  
  // === DATA ANALYTICS ===
  "Data Analytics Foundations": [],
  "Data Analytics Practice": [],
  "Data Analytics using PowerBI": [],
  "Data Analytics using Tableau": [],
  
  // === ML ===
  "Introduction to ML and Classification Algorithms": [],
  "Supervised Learning: Regression": [],
  
  // === DSA FOUNDATION ===
  "DSA Foundation": []
};

// Get topic order index for sorting
function getTopicOrderIndex(courseName, topic) {
  const courseTopics = TOPIC_ORDER[courseName];
  if (!courseTopics) return 999; // Unknown course, put at end
  
  const index = courseTopics.findIndex(t => 
    t.toLowerCase() === topic?.toLowerCase() ||
    topic?.toLowerCase().includes(t.toLowerCase()) ||
    t.toLowerCase().includes(topic?.toLowerCase())
  );
  
  return index >= 0 ? index : 999;
}

// Session type priority for ordering within a topic
const SESSION_TYPE_ORDER = {
  'LEARNING_SET': 1,
  'QUIZ': 2,
  'PRACTICE': 3,
  'QUESTION_SET': 4,
  'EXAM': 5,
  'ASSESSMENT': 6,
  'PROJECT': 7
};

// Get session order within a topic based on session name patterns
function getSessionNameOrder(sessionName) {
  const name = sessionName?.toLowerCase() || '';
  
  // Main topic video/content comes first
  if (!name.includes('|') && !name.includes('reading material') && !name.includes('quiz') && 
      !name.includes('practice') && !name.includes('coding') && !name.includes('mcq') &&
      !name.includes('daily') && !name.includes('classroom')) {
    return 0;
  }
  // Reading material comes after main content
  if (name.includes('reading material')) return 1;
  // Cheat sheet
  if (name.includes('cheat sheet')) return 2;
  // Classroom Quiz A, B, C
  if (name.includes('classroom quiz a')) return 3;
  if (name.includes('classroom quiz b')) return 4;
  if (name.includes('classroom quiz c')) return 5;
  // MCQ Practice
  if (name.includes('mcq practice')) return 6;
  // Coding Practice
  if (name.includes('coding practice')) return 7;
  // Daily Quiz
  if (name.includes('daily quiz')) return 8;
  // Other quizzes
  if (name.includes('quiz')) return 9;
  // Practice
  if (name.includes('practice')) return 10;
  
  return 50; // Default for unknown patterns
}

// Apply default duration if not provided
function applyDefaultDuration(session) {
  if (!session.durationMins || session.durationMins <= 0) {
    const setType = session.setType || "LEARNING_SET";
    session.durationMins = DEFAULT_DURATIONS[setType] || 15;
  }
  return session;
}

// @desc    Get all unique courses
// @route   GET /api/curriculum/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const courses = await Curriculum.distinct("courseName");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get topics for a specific course in correct order
// @route   GET /api/curriculum/courses/:courseName/topics
// @access  Public
export const getTopics = async (req, res) => {
  try {
    const { courseName } = req.params;
    const topics = await Curriculum.distinct("topic", { courseName });
    
    // Sort topics according to predefined order
    const sortedTopics = topics.sort((a, b) => {
      return getTopicOrderIndex(courseName, a) - getTopicOrderIndex(courseName, b);
    });
    
    res.status(200).json(sortedTopics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sessions for a specific course
// @route   GET /api/curriculum/courses/:courseName/sessions
// @access  Public
export const getSessions = async (req, res) => {
  try {
    const { courseName } = req.params;
    const sessions = await Curriculum.find({ courseName }).sort({
      sequenceNumber: 1,
    });

    // Apply default durations for sessions without duration
    const sessionsWithDurations = sessions.map((session) => {
      const sessionObj = session.toObject();
      return applyDefaultDuration(sessionObj);
    });
    
    // Sort sessions by topic order first, then by session name order within topic
    const sortedSessions = sessionsWithDurations.sort((a, b) => {
      const topicOrderA = getTopicOrderIndex(courseName, a.topic);
      const topicOrderB = getTopicOrderIndex(courseName, b.topic);
      
      if (topicOrderA !== topicOrderB) {
        return topicOrderA - topicOrderB;
      }
      
      // Within same topic, sort by session name pattern
      const sessionOrderA = getSessionNameOrder(a.sessionName);
      const sessionOrderB = getSessionNameOrder(b.sessionName);
      
      if (sessionOrderA !== sessionOrderB) {
        return sessionOrderA - sessionOrderB;
      }
      
      // If same pattern, use sequence number as tiebreaker
      return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
    });

    res.status(200).json(sortedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
