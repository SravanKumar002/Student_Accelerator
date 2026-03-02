import StudentData from "../models/StudentData.js";
import Curriculum from "../models/Curriculum.js";
import GeneratedPath from "../models/GeneratedPath.js";

// @desc    Get student data (profile, goals, availability)
// @route   GET /api/student/me
// @access  Private
export const getStudentData = async (req, res) => {
  try {
    const studentData = await StudentData.findOne({ user: req.user.id });

    if (!studentData) {
      return res.status(404).json({ message: "Student data not found" });
    }

    res.status(200).json(studentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create student data onboarding
// @route   POST /api/student/me
// @access  Private
export const createStudentData = async (req, res) => {
  try {
    const { profile, goals, availability } = req.body;

    const existingData = await StudentData.findOne({ user: req.user.id });
    if (existingData) {
      return res
        .status(400)
        .json({ message: "Student data already exists. Use PUT to update." });
    }

    const studentData = await StudentData.create({
      user: req.user.id,
      profile,
      goals,
      availability,
    });

    res.status(201).json(studentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student data
// @route   PUT /api/student/me
// @access  Private
export const updateStudentData = async (req, res) => {
  try {
    const { profile, goals, availability } = req.body;

    let studentData = await StudentData.findOne({ user: req.user.id });

    if (!studentData) {
      return res.status(404).json({ message: "Student data not found" });
    }

    studentData.profile = profile || studentData.profile;
    studentData.goals = goals || studentData.goals;
    studentData.availability = availability || studentData.availability;

    const updatedData = await studentData.save();

    res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Correct learning track flow order:
// Static → Responsive → Python → JavaScript → SQL → Node JS
// This is the recommended sequence for full-stack learning
const STACK_TOPICS = {
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

const PROGRAM_MULTIPLIER = {
  basic: 1.3,
  academy: 1.0,
  intensive: 0.7,
};

// Learning pace based on skill level
// This affects cheat sheet and revision material durations
const PACE_SETTINGS = {
  slow: {
    cheatSheetMins: 60, // Slow learners need 60 mins for cheat sheets/revision
    learningSetMins: 45, // More time for learning materials
    quizMins: 20, // More time for quizzes
  },
  moderate: {
    cheatSheetMins: 40, // Moderate pace: 40 mins for cheat sheets
    learningSetMins: 35,
    quizMins: 15,
  },
  fast: {
    cheatSheetMins: 25, // Fast learners: 20-30 mins for cheat sheets
    learningSetMins: 25,
    quizMins: 10,
  },
};

function determineLearningPace(skillLevel) {
  if (skillLevel <= 2) return "slow";
  if (skillLevel >= 4) return "fast";
  return "moderate";
}

function determineProgram(data) {
  const { currentSkillLevel } = data.goals;
  const hasBacklogs = data.profile.hasBacklogs;

  if (currentSkillLevel <= 2 || hasBacklogs) return "basic";
  if (currentSkillLevel >= 4) return "intensive";
  return "academy";
}

/**
 * Generate a creative, concise sprint title from a set of topic names.
 * Instead of dumping all topics into the heading, we produce a clean label.
 */
function generateSprintTitle(weekTopics, weekNum, courseName) {
  const topics = Array.from(weekTopics);
  if (topics.length === 0) return `Week ${weekNum} Sprint`;
  if (topics.length === 1) return topics[0];
  if (topics.length === 2) return `${topics[0]} & ${topics[1]}`;

  // Keyword-based theme detection for richer titles
  const joined = topics.join(" ").toLowerCase();
  const themes = [];

  if (joined.includes("introduction") || joined.includes("intro"))
    themes.push("Foundations");
  if (
    joined.includes("oop") ||
    joined.includes("object oriented") ||
    joined.includes("abstraction") ||
    joined.includes("polymorphism") ||
    joined.includes("inheritance")
  )
    themes.push("OOP Concepts");
  if (
    joined.includes("function") ||
    joined.includes("recursion") ||
    joined.includes("scope") ||
    joined.includes("built-in")
  )
    themes.push("Functions & Logic");
  if (
    joined.includes("list") ||
    joined.includes("matri") ||
    joined.includes("nested") ||
    joined.includes("data structure")
  )
    themes.push("Data Structures");
  if (
    joined.includes("loop") ||
    joined.includes("conditional") ||
    joined.includes("control")
  )
    themes.push("Control Flow");
  if (
    joined.includes("string") ||
    joined.includes("variable") ||
    joined.includes("type") ||
    joined.includes("conversion")
  )
    themes.push("Core Syntax");
  if (
    joined.includes("library") ||
    joined.includes("module") ||
    joined.includes("package")
  )
    themes.push("Libraries");
  if (
    joined.includes("problem solving") ||
    joined.includes("practice") ||
    joined.includes("coding")
  )
    themes.push("Problem Solving");
  if (
    joined.includes("html") ||
    joined.includes("css") ||
    joined.includes("web") ||
    joined.includes("responsive")
  )
    themes.push("Web Fundamentals");
  if (
    joined.includes("javascript") ||
    joined.includes("js") ||
    joined.includes("dom") ||
    joined.includes("event")
  )
    themes.push("JavaScript");
  if (
    joined.includes("react") ||
    joined.includes("component") ||
    joined.includes("hook") ||
    joined.includes("state")
  )
    themes.push("React");
  if (
    joined.includes("api") ||
    joined.includes("http") ||
    joined.includes("fetch") ||
    joined.includes("rest")
  )
    themes.push("APIs & Networking");
  if (
    joined.includes("sql") ||
    joined.includes("database") ||
    joined.includes("query") ||
    joined.includes("table")
  )
    themes.push("Databases & SQL");
  if (
    joined.includes("node") ||
    joined.includes("express") ||
    joined.includes("server") ||
    joined.includes("middleware")
  )
    themes.push("Backend & Node.js");
  if (
    joined.includes("mongo") ||
    joined.includes("crud") ||
    joined.includes("aggregat")
  )
    themes.push("MongoDB");
  if (
    joined.includes("git") ||
    joined.includes("linux") ||
    joined.includes("terminal") ||
    joined.includes("cli")
  )
    themes.push("Dev Tools & Git");
  if (
    joined.includes("ai") ||
    joined.includes("ml") ||
    joined.includes("model") ||
    joined.includes("genai") ||
    joined.includes("llm")
  )
    themes.push("AI & ML");
  if (
    joined.includes("analytics") ||
    joined.includes("pandas") ||
    joined.includes("numpy") ||
    joined.includes("visualization")
  )
    themes.push("Data Analytics");
  if (
    joined.includes("bootstrap") ||
    joined.includes("tailwind") ||
    joined.includes("flex") ||
    joined.includes("grid")
  )
    themes.push("CSS Frameworks & Layouts");
  if (
    joined.includes("dsa") ||
    joined.includes("sorting") ||
    joined.includes("search") ||
    joined.includes("tree") ||
    joined.includes("graph")
  )
    themes.push("DSA");

  // Deduplicate and pick the top 2 themes
  const uniqueThemes = [...new Set(themes)];

  if (uniqueThemes.length >= 2) {
    return `${uniqueThemes[0]}, ${uniqueThemes[1]} & More`;
  } else if (uniqueThemes.length === 1) {
    return `${uniqueThemes[0]} & ${topics.length} Topics`;
  }

  // Fallback: use the first topic + count
  return `${topics[0]} & ${topics.length - 1} More Topics`;
}

/**
 * Generate a short, descriptive summary for a week's sessions.
 */
function generateSprintDescription(sessions, topics, weekNum) {
  const topicList = Array.from(topics);
  const sessionCount = sessions.length;

  const sampleTopics = topicList.slice(0, 3).join(", ");
  const extra = topicList.length > 3 ? ` and ${topicList.length - 3} more` : "";

  return `Covers ${sessionCount} sessions across ${topicList.length} topics including ${sampleTopics}${extra}.`;
}

// Recommended next-track progression when a track's courses are exhausted
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
  fullstack: [], // fullstack already has everything
};

// Track completion messages and next track suggestions
const TRACK_NAMES = {
  backend: "Backend Development",
  frontend: "Frontend Development",
  fullstack: "Full Stack Development",
  "ai-ml": "AI/ML Engineering",
  dsa: "Data Structures & Algorithms",
  sql: "SQL & Databases",
  python: "Python Programming",
};

// What track to suggest after completing a given track
const NEXT_TRACK_SUGGESTIONS = {
  backend: {
    nextTrack: "frontend",
    message:
      "🎉 Congratulations! You've completed all Backend technologies! You can now move to Frontend Development to become a Full Stack Developer.",
    courses: [
      "Build Your Own Static Website",
      "Build Your Own Responsive Website",
      "Introduction to React JS",
    ],
  },
  frontend: {
    nextTrack: "backend",
    message:
      "🎉 Congratulations! You've mastered Frontend Development! Consider moving to Backend Development to become a Full Stack Developer.",
    courses: [
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
    courses: ["Node JS", "MongoDB", "Data Analytics Foundations"],
  },
  python: {
    nextTrack: "ai-ml",
    message:
      "🎉 Congratulations! You've completed Python Programming! Consider exploring AI/ML or Data Science next.",
    courses: [
      "Data Analytics Foundations",
      "Introduction to ML and Classification Algorithms",
    ],
  },
  dsa: {
    nextTrack: "fullstack",
    message:
      "🎉 Congratulations! You've mastered DSA! You're now ready to build complete applications. Consider Full Stack Development.",
    courses: ["Introduction to React JS", "Node JS", "MongoDB"],
  },
  "ai-ml": {
    nextTrack: "fullstack",
    message:
      "🎉 Congratulations! You've completed AI/ML track! Consider learning Full Stack to build end-to-end ML applications.",
    courses: [
      "Build Your Own Dynamic Web Application",
      "Node JS",
      "Introduction to React JS",
    ],
  },
  fullstack: {
    nextTrack: null,
    message:
      "🏆 Amazing! You've completed the entire Full Stack track! You're now a well-rounded developer ready for any challenge!",
    courses: [],
  },
};

// @desc    Generate learning path from curriculum data
// @route   POST /api/student/generate-path
// @access  Public (for now, or private if logged in)
export const generatePath = async (req, res) => {
  try {
    const { profile, goals, availability } = req.body;
    const studentData = { profile, goals, availability };

    const program = determineProgram(studentData);
    const multiplier = PROGRAM_MULTIPLIER[program];
    const weeklyHours =
      availability.weekdayHours * 5 + availability.weekendHours * 2;

    // Determine learning pace from skill level
    const learningPace = determineLearningPace(goals.currentSkillLevel);
    const paceSettings = PACE_SETTINGS[learningPace];

    // Determine which courses to fetch based on targetStack or courseName
    const targetStack = goals.targetStack || "fullstack";
    const stackCourses = STACK_TOPICS[targetStack] || STACK_TOPICS["fullstack"];

    const DURATION_WEEKS = {
      "1-week": 1,
      "2-week": 2,
      "3-week": 3,
      "4-week": 4,
      "1-month": 4,
      "2-month": 8,
    };
    const maxWeeks = DURATION_WEEKS[availability.planDuration] || 1;
    const totalAvailableMins = weeklyHours * 60 * maxWeeks;

    // --- Collect curriculum items with deduplication ---
    const seenIds = new Set(); // track _id to prevent duplicates
    let curriculumItems = []; // final ordered list
    const courseOrder = []; // track which course each item belongs to (by index)

    /**
     * Helper: fetch a course's items from DB, deduplicate, and append.
     * Returns total minutes added.
     */
    async function appendCourse(courseName) {
      const items = await Curriculum.find({ courseName }).sort({
        sequenceNumber: 1,
      });
      let addedMins = 0;
      for (const item of items) {
        const idStr = item._id.toString();
        if (seenIds.has(idStr)) continue; // skip duplicate
        seenIds.add(idStr);
        curriculumItems.push(item);
        courseOrder.push(courseName);
        let d = parseInt(item.duration, 10);
        if (isNaN(d) || d === 0) d = 45;
        addedMins += Math.ceil(d * multiplier);
      }
      return addedMins;
    }

    let filledMins = 0;

    if (goals.courseName && goals.courseName !== "all") {
      // Single course mode — start with selected course
      filledMins += await appendCourse(goals.courseName);

      // Continue with subsequent courses in the learning track
      if (filledMins < totalAvailableMins && stackCourses.length > 0) {
        const courseIndex = stackCourses.indexOf(goals.courseName);
        const nextCourses =
          courseIndex !== -1
            ? stackCourses.slice(courseIndex + 1)
            : stackCourses.filter((c) => c !== goals.courseName);

        for (const nextCourse of nextCourses) {
          if (filledMins >= totalAvailableMins) break;
          filledMins += await appendCourse(nextCourse);
        }
      }

      // If the track's own courses are exhausted but time remains,
      // continue with TRACK_CONTINUATION courses
      if (filledMins < totalAvailableMins) {
        const continuationCourses = TRACK_CONTINUATION[targetStack] || [];
        for (const contCourse of continuationCourses) {
          if (filledMins >= totalAvailableMins) break;
          filledMins += await appendCourse(contCourse);
        }
      }
    } else {
      // Multi-course mode - fetch all courses in the stack order
      for (const courseName of stackCourses) {
        filledMins += await appendCourse(courseName);
      }

      // If stack is exhausted but time remains, pull continuation courses
      if (filledMins < totalAvailableMins) {
        const continuationCourses = TRACK_CONTINUATION[targetStack] || [];
        for (const contCourse of continuationCourses) {
          if (filledMins >= totalAvailableMins) break;
          filledMins += await appendCourse(contCourse);
        }
      }
    }

    if (curriculumItems.length === 0) {
      return res
        .status(404)
        .json({ message: "No curriculum found for the selected path." });
    }

    // Slice items based on what user has completed
    if (
      goals.lastCompletedSessionId &&
      goals.lastCompletedSessionId !== "none"
    ) {
      const index = curriculumItems.findIndex(
        (item) => item._id.toString() === goals.lastCompletedSessionId,
      );
      if (index !== -1) {
        curriculumItems = curriculumItems.slice(index + 1);
        courseOrder.splice(0, index + 1);
      }
    }

    if (curriculumItems.length === 0) {
      return res.status(200).json({
        student: studentData,
        program,
        modules: [],
        totalWeeks: 0,
        weeklyHours,
      });
    }

    const weeklyMinsLimit = weeklyHours * 60;

    const modules = [];
    let currentWeek = 1;
    let currentWeekMins = 0;
    let currentSessions = [];
    let weekTopics = new Set();
    let weekCourses = new Set(); // courses touched this week
    let prevCourse = courseOrder[0] || ""; // track course transitions

    /**
     * Flush the current week's sessions into a module.
     * Detects course boundaries and adds courseTransition info.
     */
    function flushWeek() {
      const courseTransitions = [];
      // Detect course transitions within this week's sessions
      let lastCourse = null;
      for (const sess of currentSessions) {
        if (lastCourse && sess.courseName && sess.courseName !== lastCourse) {
          courseTransitions.push({
            completed: lastCourse,
            next: sess.courseName,
            message: `🎉 You completed ${lastCourse}! Next up: ${sess.courseName}`,
          });
        }
        if (sess.courseName) lastCourse = sess.courseName;
      }

      // Remove internal courseName from session objects before sending
      const cleanSessions = currentSessions.map(
        ({ courseName: _cn, ...rest }) => rest,
      );

      const mod = {
        id: `mod-week-${currentWeek}`,
        name: `Week ${currentWeek} Plan`,
        topic: generateSprintTitle(weekTopics, currentWeek, goals.courseName),
        topicsList: Array.from(weekTopics),
        coursesInWeek: Array.from(weekCourses),
        hoursRequired: Math.round((currentWeekMins / 60) * 10) / 10,
        weeksAllocated: 1,
        description: generateSprintDescription(
          cleanSessions,
          weekTopics,
          currentWeek,
        ),
        status: currentWeek === 1 ? "current" : "upcoming",
        sessions: cleanSessions,
      };

      // Attach course transition info if a boundary was crossed
      if (courseTransitions.length > 0) {
        mod.courseTransitions = courseTransitions;
      }

      modules.push(mod);
    }

    for (let i = 0; i < curriculumItems.length; i++) {
      if (currentWeek > maxWeeks) break;

      const item = curriculumItems[i];
      const itemCourse = courseOrder[i] || "";

      let currentDuration = parseInt(item.duration, 10);
      const name = (item.sessionName || "").toLowerCase();
      const type = (item.setType || "").toLowerCase();

      if (isNaN(currentDuration) || currentDuration === 0) {
        // Determine duration based on session type and learning pace
        if (
          name.includes("cheat sheet") ||
          name.includes("cheatsheet") ||
          name.includes("reading material")
        ) {
          // Cheat sheets / Reading materials: duration based on learning pace
          currentDuration = paceSettings.cheatSheetMins;
        } else if (
          name.includes("coding practice") ||
          type.includes("coding") ||
          type.includes("practice")
        ) {
          currentDuration = 60; // Coding practice: 1 hour
        } else if (
          name.includes("mcq") ||
          type.includes("quiz") ||
          name.includes("quiz")
        ) {
          currentDuration = paceSettings.quizMins;
        } else if (type.includes("learning_set") || name.includes("learning")) {
          currentDuration = paceSettings.learningSetMins;
        } else {
          currentDuration = 30; // Default for other types
        }
      } else {
        // If duration exists in CSV but it's a cheat sheet, still apply pace-based override
        if (
          name.includes("cheat sheet") ||
          name.includes("cheatsheet") ||
          name.includes("reading material")
        ) {
          currentDuration = paceSettings.cheatSheetMins;
        }
      }

      // Apply program multiplier
      currentDuration = Math.ceil(currentDuration * multiplier);

      if (
        currentWeekMins + currentDuration > weeklyMinsLimit &&
        currentSessions.length > 0
      ) {
        // finish week module
        flushWeek();

        currentWeek++;
        if (currentWeek > maxWeeks) break;

        currentWeekMins = 0;
        currentSessions = [];
        weekTopics = new Set();
        weekCourses = new Set();
      }

      currentWeekMins += currentDuration;
      // Build CCBP learning portal URL using c_id, t_id, s_id
      const ccbpUrl =
        item.courseId && item.topicId && item.unitId
          ? `https://learning.ccbp.in/course?c_id=${item.courseId}&t_id=${item.topicId}&s_id=${item.unitId}`
          : null;

      currentSessions.push({
        id: item._id ? item._id.toString() : Math.random().toString(),
        topic: item.topic || "General",
        sessionName: item.sessionName || item.topic,
        durationMins: currentDuration,
        setType: item.setType || "",
        ccbpUrl,
        courseName: itemCourse, // internal — will be stripped before sending
      });
      weekTopics.add(item.topic || "General");
      weekCourses.add(itemCourse);
      prevCourse = itemCourse;
    }

    // flush last week if any sessions remain and we didn't exceed max weeks
    if (currentWeek <= maxWeeks && currentSessions.length > 0) {
      flushWeek();
    }

    // --- Add a "next course suggestion" if the plan ends and more content exists ---
    let suggestion = null;
    const lastModuleCourses =
      modules.length > 0 ? modules[modules.length - 1].coursesInWeek || [] : [];
    const lastCourseInPlan =
      lastModuleCourses[lastModuleCourses.length - 1] || "";

    // Check if there are still more courses in the stack or continuation
    const allPlannedCourses = new Set(courseOrder);
    const remainingStackCourses = stackCourses.filter(
      (c) => !allPlannedCourses.has(c),
    );
    const continuationCourses = (TRACK_CONTINUATION[targetStack] || []).filter(
      (c) => !allPlannedCourses.has(c),
    );

    // Check if the entire track is completed (all stack courses are planned)
    const trackCompleted = remainingStackCourses.length === 0;

    // Build suggestion based on track completion status
    let trackCompletion = null;

    if (trackCompleted) {
      // Track is fully completed! Show track completion message
      const trackSuggestion = NEXT_TRACK_SUGGESTIONS[targetStack];
      if (trackSuggestion) {
        trackCompletion = {
          completed: true,
          trackName: TRACK_NAMES[targetStack] || targetStack,
          message: trackSuggestion.message,
          nextTrack: trackSuggestion.nextTrack,
          nextTrackName: trackSuggestion.nextTrack
            ? TRACK_NAMES[trackSuggestion.nextTrack]
            : null,
          suggestedCourses: trackSuggestion.courses,
        };

        // Also add continuation courses as suggestion if available
        if (continuationCourses.length > 0) {
          suggestion = {
            message: `💡 Want to continue learning? You can start with "${continuationCourses[0]}" from ${TRACK_NAMES[trackSuggestion.nextTrack] || "the next track"}!`,
            nextCourse: continuationCourses[0],
          };
        }
      }
    } else {
      // Track not completed, show next course in track
      const nextAvailable =
        remainingStackCourses.length > 0
          ? remainingStackCourses[0]
          : continuationCourses.length > 0
            ? continuationCourses[0]
            : null;

      if (nextAvailable) {
        suggestion = {
          message: `🚀 Great progress! After completing your current plan, you can continue with "${nextAvailable}" to keep leveling up!`,
          nextCourse: nextAvailable,
        };
      }
    }

    const pathData = {
      student: studentData,
      program,
      modules,
      totalWeeks: modules.length,
      weeklyHours,
      ...(suggestion ? { suggestion } : {}),
      ...(trackCompletion ? { trackCompletion } : {}),
    };

    res.status(200).json(pathData);
  } catch (error) {
    console.error("Path Generation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =============================================================================
// COACH DASHBOARD ENDPOINTS
// =============================================================================

// @desc    Get all generated paths (for coach dashboard)
// @route   GET /api/student/all
// @access  Private (coach)
export const getAllPaths = async (_req, res) => {
  try {
    const paths = await GeneratedPath.find().sort({ created_at: -1 }).lean();

    // Map _id → id for frontend compatibility
    const mapped = paths.map((p) => ({
      ...p,
      id: p._id.toString(),
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error("getAllPaths Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a generated path by ID
// @route   DELETE /api/student/:id
// @access  Private (coach)
export const deletePath = async (req, res) => {
  try {
    const { id } = req.params;
    const path = await GeneratedPath.findByIdAndDelete(id);

    if (!path) {
      return res.status(404).json({ message: "Path not found" });
    }

    res.status(200).json({ message: "Path deleted successfully" });
  } catch (error) {
    console.error("deletePath Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle is_completed on a generated path
// @route   PATCH /api/student/:id/complete
// @access  Private (coach)
export const togglePathComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;

    const path = await GeneratedPath.findByIdAndUpdate(
      id,
      { is_completed: !!is_completed },
      { new: true }
    );

    if (!path) {
      return res.status(404).json({ message: "Path not found" });
    }

    res.status(200).json(path);
  } catch (error) {
    console.error("togglePathComplete Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save a generated learning path explicitly (student clicks "Save")
// @route   POST /api/student/save-path
// @access  Public
export const savePath = async (req, res) => {
  try {
    const { student, program, modules, totalWeeks, weeklyHours } = req.body;

    if (!student || !modules || !Array.isArray(modules)) {
      return res
        .status(400)
        .json({ message: "Invalid path data. student and modules are required." });
    }

    const saved = await GeneratedPath.create({
      student_name: student.profile?.name || "Unnamed Student",
      target_stack: student.goals?.targetStack || "fullstack",
      program: program || "academy",
      total_weeks: totalWeeks || modules.length,
      weekly_hours: weeklyHours || 14,
      current_skill_level: student.goals?.currentSkillLevel || 2,
      modules: modules.map((m) => ({
        topic: m.topic || "General",
        hoursRequired: m.hoursRequired || 0,
        weeksAllocated: m.weeksAllocated || 1,
        description: m.description || "",
      })),
    });

    res.status(201).json({ message: "Path saved successfully", id: saved._id });
  } catch (error) {
    console.error("savePath Error:", error);
    res.status(500).json({ message: error.message });
  }
};
