/**
 * ============================================================================
 * DATABASE CONFIGURATION - MongoDB Connection
 * ============================================================================
 *
 * This module handles connecting to the MongoDB database.
 * It uses Mongoose as the ODM (Object Document Mapper).
 *
 * CONNECTION STRING:
 * Set either MONGODB_URI or MONGO_URI in your .env file:
 *
 * For MongoDB Atlas (cloud):
 * MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-accelerator
 *
 * For local MongoDB:
 * MONGODB_URI=mongodb://localhost:27017/student-accelerator
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import mongoose from "mongoose";

// =============================================================================
// DATABASE CONNECTION FUNCTION
// =============================================================================

/**
 * Connects to MongoDB database
 *
 * This function:
 * 1. Reads connection string from environment variables
 * 2. Establishes connection to MongoDB
 * 3. Logs success or exits on failure
 *
 * @async
 * @returns {Promise<void>}
 *
 * @example
 * // In server.js
 * import connectDB from './config/db.js';
 * connectDB();
 */
const connectDB = async () => {
  try {
    // Get connection string from environment variables
    // Supports both MONGODB_URI and MONGO_URI for flexibility
    const connectionString = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!connectionString) {
      console.error("❌ Error: MongoDB connection string not found!");
      console.error("   Please set MONGODB_URI or MONGO_URI in your .env file");
      process.exit(1);
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(connectionString);

    // Log successful connection
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log error and exit process
    console.error("❌ Error connecting to MongoDB:");
    console.error(`   ${error.message}`);
    console.error("");
    console.error("   Please check:");
    console.error("   1. Your MONGODB_URI is correct in .env file");
    console.error("   2. Your IP is whitelisted in MongoDB Atlas");
    console.error("   3. MongoDB service is running (if local)");

    // Exit with failure code
    // This prevents the app from running without database
    process.exit(1);
  }
};

// =============================================================================
// EXPORT
// =============================================================================

export default connectDB;
