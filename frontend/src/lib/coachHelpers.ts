/**
 * ============================================================================
 * COACH DASHBOARD — localStorage Helpers
 * ============================================================================
 *
 * Centralised utilities for coach-specific persisted state:
 * - Pinned / starred students
 * - Custom tags per student
 * - Activity audit log
 * - Dark-mode theme preference
 *
 * All data is stored in localStorage so it survives page reloads and is
 * scoped to the current browser (coach's device).
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

// =============================================================================
// PINNED STUDENTS
// =============================================================================

const PINNED_KEY = 'coach-pinned-students';

/** Get the list of pinned student IDs. */
export function getPinnedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PINNED_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Toggle a student's pinned state. Returns the updated array. */
export function togglePin(id: string): string[] {
  const pinned = getPinnedIds();
  const idx = pinned.indexOf(id);
  if (idx >= 0) {
    pinned.splice(idx, 1);
  } else {
    pinned.push(id);
  }
  localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
  return [...pinned];
}

// =============================================================================
// STUDENT TAGS
// =============================================================================

const TAGS_KEY = 'coach-student-tags';

export interface StudentTag {
  label: string;
  color: string;
}

/** Pre-defined tag palette that coaches can quickly assign. */
export const TAG_PRESETS: StudentTag[] = [
  { label: 'Needs Help', color: '#ef4444' },
  { label: 'On Track', color: '#22c55e' },
  { label: 'Advanced', color: '#3b82f6' },
  { label: 'At Risk', color: '#f59e0b' },
  { label: 'New', color: '#8b5cf6' },
  { label: 'Follow Up', color: '#ec4899' },
];

function readAllTags(): Record<string, StudentTag[]> {
  try {
    return JSON.parse(localStorage.getItem(TAGS_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Get tags assigned to a specific student. */
export function getTagsForStudent(id: string): StudentTag[] {
  return readAllTags()[id] || [];
}

/** Add a tag to a student (no duplicates). Returns updated tags. */
export function addTagToStudent(id: string, tag: StudentTag): StudentTag[] {
  const all = readAllTags();
  const current = all[id] || [];
  if (!current.some((t) => t.label === tag.label)) {
    current.push(tag);
  }
  all[id] = current;
  localStorage.setItem(TAGS_KEY, JSON.stringify(all));
  return [...current];
}

/** Remove a tag from a student by label. Returns updated tags. */
export function removeTagFromStudent(id: string, tagLabel: string): StudentTag[] {
  const all = readAllTags();
  const current = (all[id] || []).filter((t) => t.label !== tagLabel);
  all[id] = current;
  localStorage.setItem(TAGS_KEY, JSON.stringify(all));
  return [...current];
}

// =============================================================================
// ACTIVITY LOG (audit trail)
// =============================================================================

const LOG_KEY = 'coach-activity-log';
const MAX_LOG_ENTRIES = 200;

export interface ActivityEntry {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

/** Read the full activity log (newest-first). */
export function getActivityLog(): ActivityEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Append a new entry to the top of the log. */
export function logActivity(action: string, target: string): void {
  const log = getActivityLog();
  log.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    target,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, MAX_LOG_ENTRIES)));
}

/** Clear the entire activity log. */
export function clearActivityLog(): void {
  localStorage.setItem(LOG_KEY, '[]');
}

// =============================================================================
// DARK MODE
// =============================================================================

const THEME_KEY = 'coach-theme';

export type ThemeMode = 'light' | 'dark';

/** Read the stored theme preference. */
export function getStoredTheme(): ThemeMode {
  return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light';
}

/** Apply a theme to the document and persist the choice. */
export function setStoredTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

/** Add / remove the `dark` class on `<html>`. */
export function applyTheme(theme: ThemeMode): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/** Run once on app boot to honour the saved preference. */
export function initTheme(): void {
  applyTheme(getStoredTheme());
}
