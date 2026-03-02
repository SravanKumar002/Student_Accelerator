/**
 * ============================================================================
 * SERVER ENTRY POINT
 * ============================================================================
 *
 * This is the main entry point for the Student Accelerator backend server.
 * It handles:
 * 1. Loading environment variables
 * 2. Connecting to the MongoDB database
 * 3. Starting the Express server
 *
 * TO START THE SERVER:
 * - Development: npm run dev (with hot reload via nodemon)
 * - Production: npm start
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 * - PORT: Server port (default: 5000)
 * - NODE_ENV: Environment (development/production)
 * - MONGODB_URI or MONGO_URI: MongoDB connection string
 * - JWT_SECRET: Secret key for JWT token signing
 * - GOOGLE_CLIENT_ID: Google OAuth client ID (optional)
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

// =============================================================================
// LOAD ENVIRONMENT VARIABLES
// =============================================================================

/**
 * Load environment variables from .env file
 * This must be called before accessing any process.env values
 */
dotenv.config();

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

/**
 * Connect to MongoDB database
 * This is an async operation but we don't await it here.
 * The connection will be established before requests are processed.
 * If connection fails, the process will exit with code 1.
 */
connectDB();

// =============================================================================
// START SERVER
// =============================================================================

/**
 * Server Configuration
 * Uses PORT from environment variables, or defaults to 5000
 */
const PORT = process.env.PORT || 5000;

/**
 * Start listening for incoming requests
 * Logs the server status on successful startup
 */
app.listen(PORT, () => {
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  🚀 Student Accelerator API Server`);
  console.log(`  📡 Mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`  🌐 Port: ${PORT}`);
  console.log(`  📅 Started: ${new Date().toLocaleString()}`);
  console.log("═══════════════════════════════════════════════════════════");
});
