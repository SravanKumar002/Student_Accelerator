/**
 * ============================================================================
 * STUDENT PATH DETAIL COMPONENT
 * ============================================================================
 * 
 * Detailed view of an individual student's learning path.
 * Shows comprehensive analytics and module breakdown for coaches.
 * 
 * FEATURES:
 * - Student info header with program badge
 * - Statistics cards (modules, hours, weeks)
 * - Bar chart showing hours per module
 * - Week-by-week timeline with module details
 * - Mark as completed/in-progress toggle
 * - Coach notes per student (persisted to localStorage)
 * 
 * VISUALIZATIONS:
 * - Horizontal bar chart (Recharts) showing time distribution
 * - Timeline with colored dots for each module
 * - Week range badges for multi-week modules
 * 
 * COACH ACTIONS:
 * - Toggle completion status
 * - Write / edit private notes about the student
 * - Navigate back to dashboard
 * 
 * USAGE:
 * <StudentPathDetail 
 *   student={studentData}
 *   onBack={() => goToDashboard()}
 *   onCompletionChange={(id, completed) => updateState(id, completed)}
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, Target, TrendingUp, CheckCircle2, Loader2, StickyNote, Save, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

import { toast } from 'sonner';
import {
    getTagsForStudent,
    addTagToStudent,
    removeTagFromStudent,
    TAG_PRESETS,
    type StudentTag,
} from '@/lib/coachHelpers';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Individual module within a student's learning path
 */
export interface StudentPathModule {
    /** Topic/subject of the module */
    topic: string;
    
    /** Estimated hours to complete */
    hoursRequired: number;
    
    /** Number of weeks allocated for this module */
    weeksAllocated?: number;
    
    /** Optional description of module content */
    description?: string;
}

/**
 * Complete student path record from database
 * Used for displaying student data in coach dashboard
 */
export interface StudentPathRecord {
    /** Unique identifier */
    id: string;
    
    /** Student's display name */
    student_name: string;
    
    /** Target learning stack (frontend, backend, fullstack, etc.) */
    target_stack: string;
    
    /** Program level (basic, academy, intensive) */
    program: string;
    
    /** Total weeks in the learning path */
    total_weeks: number;
    
    /** Array of modules in the path */
    modules: StudentPathModule[];
    
    /** ISO timestamp of path creation */
    created_at: string;
    
    /** Whether the path has been completed */
    is_completed?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PROGRAM_STYLES: Record<string, { label: string; class: string }> = {
  basic: { label: 'Basic', class: 'bg-success/15 text-success border-success/30' },
  academy: { label: 'Academy', class: 'bg-primary/15 text-primary border-primary/30' },
  intensive: { label: 'Intensive', class: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#8b5cf6', '#ec4899'];

// =============================================================================
// HELPER — localStorage notes
// =============================================================================

const NOTES_STORAGE_KEY = 'coach-notes';

/**
 * Read all coach notes from localStorage.
 */
function readAllNotes(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Persist a note for a given student ID.
 */
function saveNote(studentId: string, text: string) {
  const all = readAllNotes();
  if (text.trim()) {
    all[studentId] = text;
  } else {
    delete all[studentId];
  }
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(all));
}

/**
 * Get the note for a given student ID.
 */
function getNote(studentId: string): string {
  return readAllNotes()[studentId] || '';
}

// =============================================================================
// COMPONENT
// =============================================================================

interface StudentPathDetailProps {
  student: StudentPathRecord;
  onBack: () => void;
  onCompletionChange?: (id: string, completed: boolean) => void;
}

const StudentPathDetail = ({ student, onBack, onCompletionChange }: StudentPathDetailProps) => {
  const [isCompleted, setIsCompleted] = useState(!!student.is_completed);
  const [isUpdating, setIsUpdating] = useState(false);

  // ---- Coach notes ----
  const [notes, setNotes] = useState(() => getNote(student.id));
  const [notesSaved, setNotesSaved] = useState(true);

  // ---- Tags ----
  const [tags, setTags] = useState<StudentTag[]>(() => getTagsForStudent(student.id));

  const handleAddTag = (tag: StudentTag) => {
    const updated = addTagToStudent(student.id, tag);
    setTags(updated);
    toast.success(`Tag "${tag.label}" added`);
  };

  const handleRemoveTag = (label: string) => {
    const updated = removeTagFromStudent(student.id, label);
    setTags(updated);
  };

  // Mark dirty when notes text changes
  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    setNotesSaved(false);
  }, []);

  // Save notes handler
  const handleSaveNotes = useCallback(() => {
    saveNote(student.id, notes);
    setNotesSaved(true);
    toast.success('Notes saved.');
  }, [student.id, notes]);

  // Auto-save on unmount if dirty
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      saveNote(student.id, notes);
    };
    // We intentionally only run cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modules = Array.isArray(student.modules) ? student.modules : [];
  const totalHours = modules.reduce((sum, m) => sum + (m.hoursRequired || 0), 0);
  const barData = modules.map((m, i) => ({
    name: m.topic.length > 12 ? m.topic.slice(0, 10) + '\u2026' : m.topic,
    fullName: m.topic,
    hours: m.hoursRequired || 0,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const programStyle = PROGRAM_STYLES[student.program] || PROGRAM_STYLES.academy;

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      const newCompleteState = !isCompleted;
      setIsCompleted(newCompleteState);
      onCompletionChange?.(student.id, newCompleteState);
      toast.success(newCompleteState ? '\uD83C\uDF89 Path marked as completed!' : 'Path marked as in progress.');
    } catch (error) {
      toast.error('An error occurred updating the path');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to students
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold font-display">
              {student.student_name || 'Student'}'s learning path
            </h1>
            <Badge variant="outline" className={programStyle.class}>
              {programStyle.label}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {student.target_stack.replace('-', '/').toUpperCase()} · {student.total_weeks} weeks
            </span>
            {isCompleted && (
              <Badge className="bg-success/15 text-success border-success/30 border">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Completed
              </Badge>
            )}
          </div>

          {/* Approve / Reopen button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleToggleComplete}
              disabled={isUpdating}
              variant={isCompleted ? 'outline' : 'default'}
              className={isCompleted ? '' : 'bg-success text-success-foreground hover:bg-success/90'}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {isUpdating ? 'Updating...' : (isCompleted ? 'Mark as In Progress' : 'Mark as Completed')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {isCompleted
                ? 'This path is marked as completed. Click to reopen.'
                : 'Click to mark this path as completed once the student finishes.'}
            </span>
          </div>

          {/* Stat cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{modules.length}</p>
                    <p className="text-xs text-muted-foreground">Modules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalHours}h</p>
                    <p className="text-xs text-muted-foreground">Total hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{student.total_weeks}</p>
                    <p className="text-xs text-muted-foreground">Weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coach Notes */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <StickyNote className="h-5 w-5" /> Coach Notes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Private notes about this student — only visible to you.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g. Struggling with JS basics, needs extra practice sessions…"
                className="min-h-[100px] resize-y"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {notesSaved ? '✓ Saved' : '● Unsaved changes'}
                </span>
                <Button
                  size="sm"
                  variant={notesSaved ? 'outline' : 'default'}
                  onClick={handleSaveNotes}
                  disabled={notesSaved}
                  className="gap-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  {notesSaved ? 'Saved' : 'Save Notes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Tag className="h-5 w-5" /> Student Tags
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick labels to organise and categorise this student.
              </p>
            </CardHeader>
            <CardContent>
              {/* Current tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                      }}
                    >
                      {tag.label}
                      <button
                        onClick={() => handleRemoveTag(tag.label)}
                        className="hover:opacity-70 text-sm leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Preset tags */}
              <div className="flex flex-wrap gap-1.5">
                {TAG_PRESETS.filter((p) => !tags.some((t) => t.label === p.label)).map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleAddTag(preset)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border hover:bg-muted transition-colors"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.label}
                  </button>
                ))}
                {TAG_PRESETS.every((p) => tags.some((t) => t.label === p.label)) && (
                  <p className="text-xs text-muted-foreground">All tags assigned ✓</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Hours per module
              </CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No modules in this path.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} hours`, 'Hours']}
                      labelFormatter={(_, payload) => payload[0]?.payload?.fullName ?? ''}
                    />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Week-by-week timeline */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display">Week-by-week path</CardTitle>
              <p className="text-sm text-muted-foreground">Follow this order to stay on track.</p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {modules.map((mod, i) => {
                    const weekStart = modules
                      .slice(0, i)
                      .reduce((s, m) => s + (m.weeksAllocated ?? 1), 0);
                    const weeks = mod.weeksAllocated ?? 1;
                    const weekEnd = weekStart + weeks;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative pl-12"
                      >
                        <div
                          className="absolute left-2 top-1.5 h-3 w-3 rounded-full border-2 border-background shadow"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <div className={`rounded-xl border bg-card p-4 shadow-sm ${isCompleted ? 'opacity-75' : ''}`}>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold">{mod.topic}</h3>
                              {mod.description && (
                                <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Week {weekStart + 1}{weeks > 1 ? `\u2013${weekEnd}` : ''}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {mod.hoursRequired} hours
                            </span>
                            <span>{weeks} week{weeks > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              {modules.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">No modules defined.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentPathDetail;
