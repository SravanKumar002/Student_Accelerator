import fs from "fs";
import path from "path";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });
import Curriculum from "../models/Curriculum.js";

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return resolve([]);
    }
    console.log(`Reading CSV: ${filePath}`);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          courseName: data["Course Name"],
          courseId: data["Course ID"],
          topic: data["Topic"],
          topicId: data["Topic ID"],
          sessionName: data["Session Name/Unit Name"],
          setType: data["Set Type"],
          unitId: data["Unit ID"],
          duration: data["Duration (in mins)"],
          languages: data["Languages"],
          sessionLink: data["Session Link"],
          outcomes: data["Outcomes"],
          prerequisites: data["Prerequisites"],
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

// Define proper learning order for topics within courses
// Topics not in this list will be assigned order 999 and keep their original CSV order
const TOPIC_ORDER = {
  "Programming Foundations": [
    "Introduction to Python",
    "Sequence of Instructions",
    "Understanding Coding Question Formats",
    "Comparing Strings & Naming Variables",
    "Type Conversions",
    "Logical Operators & Conditonal Statements",
    "Nested Conditional Statements & Loops",
    "For Loop",
    "Nested Loops & Problem Solving",
    "Loop Control Statements & Problem Solving",
    "Lists",
    "Lists - 2",
    "List Methods and Tuples",
    "Nested Lists and String Formatting",
    "Intro to Matrices & Shorthand expressions",
    "Dictionaries",
    "Sets and Set Operations",
    "Functions",
    "Built-in Functions & Recursions",
    "Problem Solving using Recursion",
    "Scopes and Python Libraries",
    "Problem Solving and Built-in Functions",
    "Problem Solving",
    "String Methods & Problem Solving and Debugging - 3",
    "More Python Concepts",
    "Error Handling and DateTime",
    "Understanding OOPs",
    "Object Oriented Programming",
    "Encapsulation and Inheritance",
    "Abstraction and Polymorphism",
    "Problem Solving and Debugging",
    "Revision",
    "Programming Foundations Course Quiz",
  ],
  "Python for DSML": [
    "Introduction to Python",
    "Control Flow",
    "Functions",
    "Data Structures",
    "NumPy Basics",
    "Pandas Basics",
    "Data Visualization",
  ],
  "JS Essentials": [
    "Introduction to JavaScript",
    "Variables and Data Types",
    "Operators",
    "Control Flow",
    "Functions",
    "Arrays",
    "Objects",
    "DOM Manipulation",
    "Events",
    "Async JavaScript",
  ],
};

function assignSequenceNumbers(results) {
  // Group items by course
  const byCourse = {};
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    const course = item.courseName || "Unknown";
    if (!byCourse[course]) byCourse[course] = [];
    byCourse[course].push({ ...item, originalIndex: i });
  }

  // For each course, sort by topic order, then by original CSV order within topic
  const finalResults = [];
  let globalSeq = 0;

  // Process courses in their original order of first appearance
  const courseOrder = [];
  for (const item of results) {
    if (!courseOrder.includes(item.courseName)) {
      courseOrder.push(item.courseName);
    }
  }

  for (const course of courseOrder) {
    const items = byCourse[course] || [];
    const topicOrder = TOPIC_ORDER[course] || [];

    // Create a map of topic -> order index
    const topicRank = {};
    topicOrder.forEach((t, idx) => {
      topicRank[t] = idx;
    });

    // Sort: first by topic rank (known topics first), then by original CSV order
    items.sort((a, b) => {
      const rankA = topicRank[a.topic] !== undefined ? topicRank[a.topic] : 999;
      const rankB = topicRank[b.topic] !== undefined ? topicRank[b.topic] : 999;
      if (rankA !== rankB) return rankA - rankB;
      return a.originalIndex - b.originalIndex;
    });

    // Assign sequence numbers
    for (const item of items) {
      delete item.originalIndex;
      item.sequenceNumber = globalSeq++;
      finalResults.push(item);
    }
  }

  return finalResults;
}

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Check command line arguments, use default if not provided
    let filePaths = process.argv.slice(2);
    if (filePaths.length === 0) {
      filePaths = [
        "/Users/sravankumarega/Downloads/Curriculum Reference - Academy - Final.csv",
      ];
    }

    let allResults = [];
    for (const fp of filePaths) {
      const res = await parseCSV(fp);
      if (res.length > 0) {
        console.log(`Successfully parsed ${res.length} rows from ${fp}`);
        allResults = allResults.concat(res);
      }
    }

    if (allResults.length === 0) {
      console.log("No valid CSV data parsed.");
      process.exit(1);
    }

    // Sort and assign proper sequence numbers based on topic order
    console.log("Sorting curriculum by topic order...");
    const sortedResults = assignSequenceNumbers(allResults);

    // Clear existing data
    await Curriculum.deleteMany();
    console.log("Cleared existing Curriculum data");

    await Curriculum.insertMany(sortedResults);
    console.log(
      `Successfully imported total of ${sortedResults.length} records!`,
    );

    process.exit(0);
  } catch (error) {
    console.error("Data import failed:", error);
    process.exit(1);
  }
};

importData();
