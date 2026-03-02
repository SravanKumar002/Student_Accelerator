/**
 * ============================================================================
 * VALIDATE MIDDLEWARE - Request Body Validation
 * ============================================================================
 *
 * Lightweight validation helpers that run BEFORE controllers.
 * They reject bad requests early (400) so controllers stay clean.
 *
 * USAGE IN ROUTES:
 *   import { validateRegister, validateLogin } from '../middlewares/validate.js';
 *   router.post('/register', validateRegister, registerUser);
 *   router.post('/login',    validateLogin,    loginUser);
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

// =============================================================================
// HELPER — Simple email regex (good enough for 99 % of real addresses)
// =============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =============================================================================
// AUTH VALIDATORS
// =============================================================================

/**
 * Validate /register body
 * Required: email, password (≥ 6 chars)
 * Optional: name, role
 */
export const validateRegister = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "A valid email is required." });
  }

  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  return next();
};

/**
 * Validate /login body
 * Required: email, password
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  return next();
};

// =============================================================================
// STUDENT / PATH VALIDATORS
// =============================================================================

/**
 * Validate /generate-path body
 * Ensures the three required sections exist and have key fields.
 */
export const validateGeneratePath = (req, res, next) => {
  const { profile, goals, availability } = req.body;

  // --- profile ---
  if (!profile || !profile.name?.trim()) {
    return res.status(400).json({ message: "profile.name is required." });
  }

  // --- goals ---
  if (!goals) {
    return res.status(400).json({ message: "goals object is required." });
  }

  if (!goals.targetStack && !goals.courseName) {
    return res
      .status(400)
      .json({
        message:
          "Either goals.targetStack or goals.courseName must be provided.",
      });
  }

  // --- availability ---
  if (!availability) {
    return res
      .status(400)
      .json({ message: "availability object is required." });
  }

  if (
    typeof availability.weekdayHours !== "number" ||
    typeof availability.weekendHours !== "number"
  ) {
    return res
      .status(400)
      .json({ message: "weekdayHours and weekendHours must be numbers." });
  }

  return next();
};
