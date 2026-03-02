/**
 * ============================================================================
 * API CLIENT - HTTP Request Configuration
 * ============================================================================
 *
 * This file configures the Axios HTTP client for making API requests
 * to the Student Accelerator backend server.
 *
 * FEATURES:
 * - Single source of truth for API base URL (via environment variable)
 * - Auth interceptor: auto-attaches JWT token to every request
 * - Response interceptor: handles 401 (expired token) globally
 * - Typed API helper functions for every endpoint
 *
 * USAGE:
 * import api, { studentApi, curriculumApi, authApi } from '@/lib/api';
 *
 * // Raw axios:
 * const res = await api.get('/api/curriculum/courses');
 *
 * // Typed helpers (preferred):
 * const courses = await curriculumApi.getCourses();
 * const path   = await studentApi.generatePath(formData);
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import axios from "axios";
import type {
  StudentProfile,
  LearningGoals,
  Availability,
  LearningPathData,
} from "@/lib/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * API Base URL
 *
 * Reads from the VITE_API_BASE environment variable so you never need to
 * touch source code when switching between local dev and production.
 *
 * Set in .env:            VITE_API_BASE=http://localhost:5001
 * Set in .env.production: VITE_API_BASE=https://backend-student-accelerator.onrender.com
 */
export const API_BASE: string =
  import.meta.env.VITE_API_BASE || "http://localhost:5001";

/**
 * Request Timeout (in milliseconds)
 *
 * How long to wait for a response before timing out.
 * 10 seconds is a reasonable default for most operations.
 */
const REQUEST_TIMEOUT = 10_000;

// =============================================================================
// CREATE AXIOS INSTANCE
// =============================================================================

const api = axios.create({
  baseURL: API_BASE,
  timeout: REQUEST_TIMEOUT,
});

// =============================================================================
// REQUEST INTERCEPTOR — Auto-attach JWT token
// =============================================================================

/**
 * Before every request, check localStorage for a JWT token.
 * If found, attach it as a Bearer token in the Authorization header.
 * This means components never need to manually add auth headers.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// =============================================================================
// RESPONSE INTERCEPTOR — Handle 401 globally
// =============================================================================

/**
 * If any response comes back with 401 (Unauthorized), the token has
 * expired or is invalid. Clear stored credentials and reload so the
 * user sees the login / landing screen.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if we're not already on the landing page
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

// =============================================================================
// TYPED API HELPERS
// =============================================================================

/**
 * Auth API — login, register, get current user
 */
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) =>
    api.post<{
      id: string;
      name: string;
      email: string;
      role: string;
      token: string;
    }>("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{
      id: string;
      name: string;
      email: string;
      role: string;
      token: string;
    }>("/api/auth/login", data),

  firebaseGoogle: (data: { credential: string; role?: string }) =>
    api.post<{
      id: string;
      name: string;
      email: string;
      role: string;
      token: string;
    }>("/api/auth/firebase-google", data),

  getMe: () =>
    api.get<{ _id: string; name: string; email: string; role: string }>(
      "/api/auth/me",
    ),
};

/**
 * Student API — profile CRUD and path generation
 */
export const studentApi = {
  getProfile: () => api.get("/api/student/me"),

  createProfile: (data: {
    profile: StudentProfile;
    goals: LearningGoals;
    availability: Availability;
  }) => api.post("/api/student/me", data),

  updateProfile: (data: {
    profile: StudentProfile;
    goals: LearningGoals;
    availability: Availability;
  }) => api.put("/api/student/me", data),

  generatePath: (data: {
    profile: StudentProfile;
    goals: LearningGoals;
    availability: Availability;
  }) => api.post<LearningPathData>("/api/student/generate-path", data),

  savePath: (data: LearningPathData) =>
    api.post<{ message: string; id: string }>("/api/student/save-path", data),
};

/**
 * Curriculum API — courses and sessions
 */
export const curriculumApi = {
  getCourses: () => api.get<string[]>("/api/curriculum/courses"),

  getTopics: (courseName: string) =>
    api.get<string[]>(
      `/api/curriculum/courses/${encodeURIComponent(courseName)}/topics`,
    ),

  getSessions: (courseName: string) =>
    api.get(
      `/api/curriculum/courses/${encodeURIComponent(courseName)}/sessions`,
    ),
};

// =============================================================================
// EXPORT
// =============================================================================

export default api;
