/**
 * ============================================================================
 * GOALS STEP COMPONENT
 * ============================================================================
 * 
 * Second step of the onboarding wizard.
 * Collects learning objectives and preferences for path generation.
 * 
 * FIELDS COLLECTED:
 * - Primary Objective - What the student wants to achieve (placement, internship, skill-upgrade)
 * - Learning Track - Technology focus area (fullstack, frontend, backend, ai-ml, etc.)
 * - Specific Course - Optional: pick a specific course instead of full track
 * - Last Completed Session - Where the student left off (for continuation)
 * - Learning Pace - Self-assessed learning speed (1-5 scale)
 * 
 * DATA FLOW:
 * 1. Fetches available courses from backend on mount
 * 2. When a course is selected, fetches sessions for that course
 * 3. Falls back to hardcoded course lists if backend is unavailable
 * 
 * USAGE:
 * <GoalsStep 
 *   data={goalsState} 
 *   onChange={(newData) => setGoalsState(newData)} 
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { LearningGoals } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Briefcase, 
    GraduationCap, 
    Rocket, 
    Layout, 
    Server, 
    Layers, 
    Brain, 
    Code2, 
    Database, 
    Terminal 
} from 'lucide-react';
import api from '@/lib/api';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the GoalsStep component
 */
interface GoalsStepProps {
    /** Current goals data */
    data: LearningGoals;
    
    /** Callback when goals data changes */
    onChange: (data: LearningGoals) => void;
}

/**
 * Session data returned from backend
 */
interface Session {
    _id: string;
    sessionName?: string;
    topic?: string;
}

// =============================================================================
// CONSTANTS - Primary Objectives
// =============================================================================

/**
 * Available primary learning objectives
 * These define what the student is trying to achieve
 */
const GOALS = [
    { 
        value: 'placement', 
        label: 'Placement', 
        desc: 'Get job-ready for campus drives', 
        icon: Briefcase 
    },
    { 
        value: 'internship', 
        label: 'Internship', 
        desc: 'Build skills for internship roles', 
        icon: GraduationCap 
    },
    { 
        value: 'skill-upgrade', 
        label: 'Skill Upgrade', 
        desc: 'Level up your tech abilities', 
        icon: Rocket 
    },
] as const;

// =============================================================================
// CONSTANTS - Learning Tracks
// =============================================================================

/**
 * Available learning tracks
 * Each track groups related courses into a cohesive learning path
 */
const LEARNING_TRACKS = [
    { 
        value: 'fullstack', 
        label: 'Full Stack', 
        desc: 'Static → Responsive → Python → JS → SQL → Node.js', 
        icon: Layers 
    },
    { 
        value: 'frontend', 
        label: 'Frontend', 
        desc: 'HTML, CSS, JavaScript, React', 
        icon: Layout 
    },
    { 
        value: 'backend', 
        label: 'Backend', 
        desc: 'Python, JS, SQL, Node.js, MongoDB', 
        icon: Server 
    },
    { 
        value: 'ai-ml', 
        label: 'AI / ML', 
        desc: 'Python, Data Science, ML, GenAI', 
        icon: Brain 
    },
    { 
        value: 'dsa', 
        label: 'DSA', 
        desc: 'Python, JS, Data Structures & Algorithms', 
        icon: Code2 
    },
    { 
        value: 'python', 
        label: 'Python', 
        desc: 'Python Foundations & Data Science', 
        icon: Terminal 
    },
    { 
        value: 'sql', 
        label: 'SQL / DB', 
        desc: 'Python, SQL, Database Fundamentals', 
        icon: Database 
    },
] as const;

// =============================================================================
// CONSTANTS - Fallback Course Lists
// =============================================================================

/**
 * Fallback course lists per track
 * Used when backend API is unavailable
 * Maps each track to its associated course names
 */
const TRACK_COURSES: Record<string, string[]> = {
    fullstack: [
        'Build Your Own Static Website', 
        'Build Your Own Responsive Website', 
        'Modern Responsive Web Design',
        'Programming Foundations', 
        'JS Essentials', 
        'Build Your Own Dynamic Web Application',
        'Introduction to Databases', 
        'Node JS', 
        'Introduction to React JS', 
        'MongoDB',
    ],
    frontend: [
        'Build Your Own Static Website', 
        'Build Your Own Responsive Website', 
        'Modern Responsive Web Design',
        'JS Essentials', 
        'Build Your Own Dynamic Web Application', 
        'Introduction to React JS',
    ],
    backend: [
        'Programming Foundations', 
        'JS Essentials', 
        'Introduction to Databases', 
        'Node JS', 
        'MongoDB'
    ],
    'ai-ml': [
        'Programming Foundations', 
        'Python for DSML', 
        'Data Analytics Foundations', 
        'Data Analytics Practice',
        'Data Analytics using PowerBI', 
        'Data Analytics using Tableau',
        'Introduction to ML and Classification Algorithms', 
        'Supervised Learning: Regression',
        'Building LLM Applications', 
        'Generative AI',
    ],
    dsa: [
        'Programming Foundations', 
        'JS Essentials', 
        'DSA Foundation', 
        'Phase 1 : Data Structures and Algorithms', 
        'Phase 2 : Advanced DSA'
    ],
    python: [
        'Programming Foundations', 
        'Python for DSML'
    ],
    sql: [
        'Programming Foundations', 
        'Introduction to Databases'
    ],
};

/**
 * All unique fallback courses (union of every track)
 * Used when no specific track is selected
 */
const ALL_FALLBACK_COURSES = Array.from(
    new Set(Object.values(TRACK_COURSES).flat())
);

// =============================================================================
// CONSTANTS - Learning Pace
// =============================================================================

/**
 * Labels for the learning pace slider (1-5)
 */
const PACE_LABELS = [
    'Slow Learner', 
    'Steady', 
    'Average', 
    'Fast Learner', 
    'Rapid Learner'
];

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * GoalsStep Component
 * 
 * Renders the goals selection form with:
 * - Card-based objective selection
 * - Grid of learning track options
 * - Course dropdown (fetched from API)
 * - Session selector for course continuation
 * - Pace slider
 * 
 * @param props - Component props
 * @param props.data - Current goals data
 * @param props.onChange - Callback when data changes
 */
const GoalsStep = ({ data, onChange }: GoalsStepProps) => {
    // -------------------------------------------------------------------------
    // STATE
    // -------------------------------------------------------------------------
    
    /** List of available courses */
    const [courses, setCourses] = useState<string[]>([]);
    
    /** Sessions for the selected course */
    const [sessions, setSessions] = useState<Session[]>([]);
    
    /** Loading state for courses fetch */
    const [loadingCourses, setLoadingCourses] = useState(false);
    
    /** Loading state for sessions fetch */
    const [loadingSessions, setLoadingSessions] = useState(false);

    // -------------------------------------------------------------------------
    // EFFECTS - Fetch Courses
    // -------------------------------------------------------------------------
    
    /**
     * Fetches available courses from the backend API.
     * Falls back to hardcoded list if API fails.
     */
    useEffect(() => {
        const fetchCourses = async () => {
            setLoadingCourses(true);
            
            try {
                const response = await api.get('/api/curriculum/courses');
                
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setCourses(response.data);
                } else {
                    // Empty response - use fallback
                    setCourses(ALL_FALLBACK_COURSES);
                }
            } catch (error) {
                console.error('Failed to load courses, using fallback list:', error);
                setCourses(ALL_FALLBACK_COURSES);
            } finally {
                setLoadingCourses(false);
            }
        };
        
        fetchCourses();
    }, []);

    // -------------------------------------------------------------------------
    // EFFECTS - Fetch Sessions
    // -------------------------------------------------------------------------
    
    /**
     * Fetches sessions for the selected course.
     * Only runs when a specific course is selected (not "all").
     */
    useEffect(() => {
        // Only fetch if a specific course is selected
        if (!data.courseName || data.courseName === 'all') {
            setSessions([]);
            return;
        }

        const fetchSessions = async () => {
            setLoadingSessions(true);
            
            try {
                const encodedCourse = encodeURIComponent(data.courseName);
                const response = await api.get(`/api/curriculum/courses/${encodedCourse}/sessions`);
                
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setSessions(response.data);
                } else {
                    setSessions([]);
                }
            } catch (error) {
                console.error('Failed to load sessions:', error);
                setSessions([]);
            } finally {
                setLoadingSessions(false);
            }
        };
        
        fetchSessions();
    }, [data.courseName]);

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    /**
     * Handles learning track selection.
     * Resets course and session selection when track changes.
     */
    const handleTrackSelect = (trackValue: string) => {
        onChange({ 
            ...data, 
            targetStack: trackValue as LearningGoals['targetStack'], 
            courseName: 'all', 
            lastCompletedSessionId: '' 
        });
    };

    /**
     * Handles course selection.
     * Resets session selection when course changes.
     */
    const handleCourseSelect = (courseName: string) => {
        onChange({ 
            ...data, 
            courseName, 
            lastCompletedSessionId: '' 
        });
    };

    /**
     * Handles session selection.
     */
    const handleSessionSelect = (sessionId: string) => {
        onChange({ 
            ...data, 
            lastCompletedSessionId: sessionId === 'none' ? '' : sessionId 
        });
    };

    /**
     * Gets filtered courses based on selected track.
     */
    const getFilteredCourses = (): string[] => {
        if (data.targetStack && TRACK_COURSES[data.targetStack]) {
            return courses.filter(c => TRACK_COURSES[data.targetStack].includes(c));
        }
        return courses;
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-extrabold font-display mb-2 text-foreground tracking-tight">
                    Your Target Goals
                </h2>
                <p className="text-muted-foreground font-medium text-lg">
                    Define the objective for your personalized roadmap.
                </p>
            </div>

            {/* Primary Objective Selection */}
            <div className="space-y-4">
                <Label className="text-foreground/80 text-sm font-bold">
                    Primary Objective
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {GOALS.map((goal) => {
                        const isSelected = data.primaryGoal === goal.value;
                        
                        return (
                            <button
                                key={goal.value}
                                onClick={() => onChange({ ...data, primaryGoal: goal.value })}
                                className={`p-5 rounded-2xl border text-left transition-all card-hover ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-[0_8px_20px_rgba(99,102,241,0.1)]'
                                        : 'border-border bg-white/60 hover:border-primary/30 shadow-sm'
                                }`}
                            >
                                <goal.icon 
                                    className={`h-7 w-7 mb-3 transition-colors ${
                                        isSelected ? 'text-primary' : 'text-muted-foreground/60'
                                    }`} 
                                />
                                <div className="font-bold text-foreground">{goal.label}</div>
                                <div className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                                    {goal.desc}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Learning Track Selection */}
            <div className="space-y-4">
                <Label className="text-foreground/80 text-sm font-bold">
                    Learning Track
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {LEARNING_TRACKS.map((track) => {
                        const isSelected = data.targetStack === track.value;
                        
                        return (
                            <button
                                key={track.value}
                                onClick={() => handleTrackSelect(track.value)}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-[0_6px_16px_rgba(99,102,241,0.1)]'
                                        : 'border-border bg-white/60 hover:border-primary/30 shadow-sm'
                                }`}
                            >
                                <track.icon 
                                    className={`h-5 w-5 mb-2 transition-colors ${
                                        isSelected ? 'text-primary' : 'text-muted-foreground/50'
                                    }`} 
                                />
                                <div className="font-bold text-sm text-foreground">{track.label}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 font-medium leading-snug">
                                    {track.desc}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Specific Course Selection */}
            <div className="space-y-4">
                <Label className="text-foreground/80 text-sm font-bold">
                    Or Pick a Specific Course
                </Label>
                <Select
                    disabled={loadingCourses}
                    value={data.courseName}
                    onValueChange={handleCourseSelect}
                >
                    <SelectTrigger className="w-full bg-white border-border text-foreground h-14 rounded-xl focus:ring-primary shadow-sm">
                        <SelectValue placeholder="Select a specific course (or use track above)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border text-foreground max-h-[300px] overflow-y-auto">
                        <SelectItem 
                            value="all" 
                            className="focus:bg-primary/10 focus:text-primary font-bold"
                        >
                            📚 Full Learning Track (Recommended)
                        </SelectItem>
                        {getFilteredCourses().map((course) => (
                            <SelectItem 
                                key={course} 
                                value={course} 
                                className="focus:bg-muted focus:text-foreground"
                            >
                                {course}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground font-medium">
                    Choose "Full Learning Track" for the complete roadmap, or pick a specific course.
                </p>
            </div>

            {/* Session Selection (only shown when a specific course is selected) */}
            {data.courseName && data.courseName !== 'all' && (
                <div className="space-y-4">
                    <Label className="text-foreground/80 text-sm font-bold">
                        Last Completed Session (Optional)
                    </Label>
                    
                    {/* Loading State */}
                    {loadingSessions && (
                        <div className="w-full h-14 rounded-xl border border-border bg-white flex items-center px-4 text-sm text-muted-foreground animate-pulse">
                            Loading sessions…
                        </div>
                    )}
                    
                    {/* No Sessions Available */}
                    {!loadingSessions && sessions.length === 0 && (
                        <div className="w-full rounded-xl border border-border bg-white p-4">
                            <p className="text-sm text-muted-foreground">
                                ⚠️ Could not load sessions (backend may be offline). 
                                Your roadmap will start from the beginning of{' '}
                                <span className="font-semibold text-foreground">{data.courseName}</span>.
                            </p>
                        </div>
                    )}
                    
                    {/* Sessions Available */}
                    {!loadingSessions && sessions.length > 0 && (
                        <Select
                            value={data.lastCompletedSessionId || 'none'}
                            onValueChange={handleSessionSelect}
                        >
                            <SelectTrigger className="w-full bg-white border-border text-foreground h-14 rounded-xl focus:ring-primary shadow-sm">
                                <SelectValue placeholder="Select your last completed session..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-border text-foreground max-h-[300px]">
                                <SelectItem 
                                    value="none" 
                                    className="focus:bg-primary/10 focus:text-primary font-bold"
                                >
                                    🆕 Not started yet (Begin from start)
                                </SelectItem>
                                {sessions.map((session) => (
                                    <SelectItem 
                                        key={session._id} 
                                        value={session._id} 
                                        className="focus:bg-muted focus:text-foreground"
                                    >
                                        {session.sessionName || session.topic}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    
                    <p className="text-xs text-muted-foreground font-medium">
                        Select where you left off to auto-slice your roadmap.
                    </p>
                </div>
            )}

            {/* Learning Pace Slider */}
            <div className="space-y-5 pt-4">
                <div className="flex justify-between items-center">
                    <Label className="text-foreground/80 text-sm font-bold">
                        Learning Pace
                    </Label>
                    <span className="text-sm font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
                        {PACE_LABELS[data.currentSkillLevel - 1]}
                    </span>
                </div>
                <Slider
                    value={[data.currentSkillLevel]}
                    onValueChange={([value]) => onChange({ ...data, currentSkillLevel: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                    {PACE_LABELS.map((label) => (
                        <span key={label}>{label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default GoalsStep;
