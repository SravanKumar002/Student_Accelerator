/**
 * ============================================================================
 * PATH TIMELINE COMPONENT
 * ============================================================================
 * 
 * Displays the generated learning path as an interactive timeline.
 * This is the main output screen after a student completes the onboarding form.
 * 
 * FEATURES:
 * - Visual timeline with week indicators
 * - Expandable module cards showing session details
 * - Direct links to CCBP learning portal for each session
 * - Progress tracking indicators
 * - PDF export functionality
 * - Motivational quotes for encouragement
 * - Course transition banners
 * - Track completion celebrations
 * 
 * VISUAL ELEMENTS:
 * - Timeline center line with gradient
 * - Status icons (completed, current, upcoming)
 * - Session type badges (Learn, Practice, Quiz, etc.)
 * - Animated entrance effects
 * 
 * MODULE STATES:
 * - completed: Green checkmark, full opacity
 * - current: Primary color, highlighted with animation
 * - upcoming: Muted, lower opacity
 * 
 * USAGE:
 * <PathTimeline 
 *   path={generatedPathData}
 *   onBack={() => goToForm()}
 *   onHome={() => goToLanding()}
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { LearningPathData } from '@/lib/types';
import { 
    Clock, 
    CheckCircle2, 
    Circle, 
    PlayCircle, 
    ArrowLeft, 
    Target, 
    Download, 
    ChevronDown, 
    ChevronUp, 
    ExternalLink, 
    BookOpen, 
    Code, 
    FileQuestion, 
    Flame, 
    Rocket, 
    Trophy, 
    Zap, 
    Star, 
    ArrowRight, 
    GraduationCap,
    Save,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the PathTimeline component
 */
interface PathTimelineProps {
    /** The generated learning path data */
    path: LearningPathData;
    
    /** Callback to go back to edit the form */
    onBack: () => void;
    
    /** Callback to return to home/landing page */
    onHome: () => void;

    /** Callback to save the path to the database (for coach dashboard) */
    onSave?: () => Promise<void>;
}

/**
 * Configuration for session type display
 */
interface SetTypeConfig {
    icon: typeof BookOpen;
    color: string;
    label: string;
}

// =============================================================================
// CONSTANTS - Program Types
// =============================================================================

/**
 * Visual configuration for different program levels
 * Each program has a distinct color scheme and emoji
 */
const PROGRAM_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
    basic: { 
        label: 'Basic', 
        color: 'bg-success text-success-foreground', 
        emoji: '🌱' 
    },
    academy: { 
        label: 'Academy', 
        color: 'accent-gradient text-accent-foreground', 
        emoji: '🚀' 
    },
    intensive: { 
        label: 'Intensive', 
        color: 'bg-destructive text-destructive-foreground', 
        emoji: '🔥' 
    },
};

// =============================================================================
// CONSTANTS - Session Types
// =============================================================================

/**
 * Visual configuration for different session types
 * Maps setType values to icons, colors, and labels
 */
const SET_TYPE_ICONS: Record<string, SetTypeConfig> = {
    'LEARNING_SET': { 
        icon: BookOpen, 
        color: 'text-blue-500 bg-blue-50', 
        label: 'Learn' 
    },
    'PRACTICE': { 
        icon: Code, 
        color: 'text-green-500 bg-green-50', 
        label: 'Practice' 
    },
    'QUIZ': { 
        icon: FileQuestion, 
        color: 'text-amber-500 bg-amber-50', 
        label: 'Quiz' 
    },
    'EXAM': { 
        icon: Trophy, 
        color: 'text-purple-500 bg-purple-50', 
        label: 'Exam' 
    },
    'CODING_PRACTICE': { 
        icon: Code, 
        color: 'text-emerald-500 bg-emerald-50', 
        label: 'Code' 
    },
};

// =============================================================================
// CONSTANTS - Motivational Quotes
// =============================================================================

/**
 * Quotes displayed in the hero card
 * Rotated based on total weeks in the path
 */
const MOTIVATIONAL_QUOTES = [
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { quote: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { quote: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { quote: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
    { quote: "Every great developer you know got there by solving problems they were unqualified to solve.", author: "Patrick McKenzie" },
    { quote: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
];

/**
 * Quotes displayed within each module
 * Cycled through based on module index
 */
const MODULE_QUOTES = [
    "Every line of code you write is a step toward mastery.",
    "Consistency beats intensity. Show up every day.",
    "You're not just learning to code — you're building your future.",
    "The struggle you're in today is developing the strength you need for tomorrow.",
    "Small daily improvements over time lead to stunning results.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Stay hungry, stay foolish. Keep shipping code!",
    "Debug your doubts. Compile your confidence.",
    "You're one commit away from a breakthrough.",
    "Think like a programmer: break it down, solve it step by step.",
];

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * PathTimeline Component
 * 
 * Renders the learning path as a visual timeline with:
 * - Hero card with stats and motivational quote
 * - Progress bar showing completion
 * - Module cards with expandable session lists
 * - Course transitions and track completion celebrations
 * - PDF export functionality
 * 
 * @param props - Component props
 * @param props.path - Generated learning path data
 * @param props.onBack - Handler to go back to form
 * @param props.onHome - Handler to return home
 */
const PathTimeline = ({ path, onBack, onHome, onSave }: PathTimelineProps) => {
    // -------------------------------------------------------------------------
    // STATE
    // -------------------------------------------------------------------------
    
    /** Tracks which modules are expanded */
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    
    /** Flag for print mode (expands all modules) */
    const [isPrinting, setIsPrinting] = useState(false);

    /** Whether the path has already been saved */
    const [isSaved, setIsSaved] = useState(false);

    /** Whether a save request is in progress */
    const [isSaving, setIsSaving] = useState(false);

    // -------------------------------------------------------------------------
    // COMPUTED VALUES
    // -------------------------------------------------------------------------
    
    /** Program label configuration */
    const prog = PROGRAM_LABELS[path.program];
    
    /** Week counter for tracking progression */
    let weekCounter = 0;
    
    /** Hero section motivational quote */
    const heroQuote = MOTIVATIONAL_QUOTES[Math.floor(path.totalWeeks % MOTIVATIONAL_QUOTES.length)];
    
    /** Total number of sessions across all modules */
    const totalSessions = path.modules.reduce(
        (sum, mod) => sum + (mod.sessions?.length || 0), 
        0
    );

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    /**
     * Toggles a module's expanded/collapsed state
     */
    const toggleModule = (id: string) => {
        setExpandedModules(prev => ({ 
            ...prev, 
            [id]: !prev[id] 
        }));
    };

    /**
     * Gets the visual configuration for a session type
     */
    const getSetTypeInfo = (setType?: string): SetTypeConfig => {
        if (!setType) return SET_TYPE_ICONS['LEARNING_SET'];
        return SET_TYPE_ICONS[setType] || SET_TYPE_ICONS['LEARNING_SET'];
    };

    /**
     * Handles PDF export by expanding all modules and triggering print
     */
    const handleExportPDF = () => {
        // Expand all modules for PDF export
        const allExpanded: Record<string, boolean> = {};
        path.modules.forEach(mod => {
            allExpanded[mod.id] = true;
        });
        setExpandedModules(allExpanded);
        setIsPrinting(true);

        // Wait for state to update, then print
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 300);
    };

    /**
     * Checks if a module should be expanded (manually or for printing)
     */
    const isModuleExpanded = (modId: string): boolean => {
        return isPrinting || expandedModules[modId];
    };

    /**
     * Gets the status icon component based on module status
     */
    const getStatusIcon = (status: string) => {
        if (status === 'completed') return CheckCircle2;
        if (status === 'current') return PlayCircle;
        return Circle;
    };

    /**
     * Gets the status color class based on module status
     */
    const getStatusColor = (status: string): string => {
        if (status === 'completed') {
            return 'text-success drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]';
        }
        if (status === 'current') {
            return 'text-primary drop-shadow-[0_4px_15px_rgba(99,102,241,0.4)]';
        }
        return 'text-muted-foreground/30';
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden print:bg-white print:text-black">
            {/* ----------------------------------------------------------------
                BACKGROUND DECORATIVE ORBS
            ---------------------------------------------------------------- */}
            <div className="bg-orb w-[700px] h-[700px] top-[-300px] right-[-200px] opacity-[0.15] print:hidden" />
            <div className="bg-orb w-[600px] h-[600px] bottom-[10%] left-[-200px] opacity-[0.1] print:hidden" />
            <div className="bg-orb w-[500px] h-[500px] top-[40%] right-[-100px] opacity-[0.08] print:hidden" />

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl relative z-10">
                {/* ------------------------------------------------------------
                    TOP NAVIGATION BAR
                ------------------------------------------------------------ */}
                <div className="flex flex-wrap items-center gap-3 mb-8 print:hidden">
                    <Button 
                        variant="ghost" 
                        onClick={onBack} 
                        className="text-muted-foreground font-semibold hover:text-foreground hover:bg-muted rounded-xl px-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={onHome} 
                        className="bg-white border-border text-foreground hover:bg-muted font-semibold rounded-xl px-4 sm:px-6"
                    >
                        <Rocket className="mr-2 h-4 w-4" /> Return Home
                    </Button>
                    <div className="ml-auto flex items-center gap-2">
                        {onSave && (
                            <Button
                                onClick={async () => {
                                    if (isSaved || isSaving) return;
                                    setIsSaving(true);
                                    try {
                                        await onSave();
                                        setIsSaved(true);
                                        toast.success('🎉 Path saved! Coaches can now view it on the dashboard.');
                                    } catch {
                                        toast.error('Failed to save path. Please try again.');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaved || isSaving}
                                className={`font-bold rounded-xl px-4 sm:px-6 shadow-md ${
                                    isSaved
                                        ? 'bg-success text-white hover:bg-success/90'
                                        : 'accent-gradient text-white border-0 hover:scale-[1.02] shadow-[0_8px_20px_rgba(99,102,241,0.3)]'
                                }`}
                            >
                                {isSaving ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                                ) : isSaved ? (
                                    <><CheckCircle2 className="mr-2 h-4 w-4" /> Saved</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Save Path</>
                                )}
                            </Button>
                        )}
                        <Button 
                            onClick={handleExportPDF} 
                            className="bg-primary text-white font-bold rounded-xl px-4 sm:px-6 shadow-md hover:bg-primary/90"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* ------------------------------------------------------------
                    HERO CARD WITH STATS
                ------------------------------------------------------------ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 sm:p-8 rounded-[2rem] glass-panel bg-white/70 border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.05)] print:shadow-none print:border-none"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left: Title and Quote */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground drop-shadow-sm">
                                    {prog.emoji} {path.student.profile.name}'s Roadmap
                                </h1>
                                <Badge className={`${prog.color} px-3 py-1 text-sm font-bold rounded-full shadow-sm print:shadow-none`}>
                                    {prog.label} Path
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-base sm:text-lg font-medium flex items-center gap-2 mb-4">
                                <Flame className="h-4 w-4 text-orange-400" />
                                <span className="text-primary font-bold">{path.student.goals.courseName}</span>
                            </p>
                            
                            {/* Motivational Quote */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 mt-2">
                                <p className="text-sm italic text-foreground/80 font-medium leading-relaxed">
                                    "{heroQuote.quote}"
                                </p>
                                <p className="text-xs text-primary font-bold mt-1.5">— {heroQuote.author}</p>
                            </div>
                        </div>
                        
                        {/* Right: Stats */}
                        <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 rounded-xl bg-primary/5 border border-primary/20 shadow-inner flex-shrink-0">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                                    {path.totalWeeks}
                                </div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                    Weeks
                                </div>
                            </div>
                            <div className="w-px h-10 bg-border"></div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-display font-extrabold text-primary">
                                    {path.weeklyHours}
                                </div>
                                <div className="text-[10px] sm:text-xs text-primary/70 font-bold uppercase tracking-widest mt-1">
                                    Hrs/Wk
                                </div>
                            </div>
                            <div className="w-px h-10 bg-border"></div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-display font-extrabold text-accent">
                                    {totalSessions}
                                </div>
                                <div className="text-[10px] sm:text-xs text-accent/70 font-bold uppercase tracking-widest mt-1">
                                    Sessions
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ------------------------------------------------------------
                    PROGRESS METER
                ------------------------------------------------------------ */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-10 print:hidden"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-400" /> Your Learning Journey
                        </span>
                        <span className="text-xs font-bold text-primary">
                            {path.modules.length} Modules
                        </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full accent-gradient"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(8, (1 / path.modules.length) * 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                        Module 1 of {path.modules.length} — Let's get started!
                    </p>
                </motion.div>

                {/* ------------------------------------------------------------
                    TIMELINE
                ------------------------------------------------------------ */}
                <div className="relative mt-8">
                    {/* Timeline Center Line */}
                    <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/30 to-border rounded-full" />

                    {/* Module Cards */}
                    {path.modules.map((mod, i) => {
                        // Calculate week range for this module
                        const startWeek = weekCounter + 1;
                        weekCounter += mod.weeksAllocated;
                        const endWeek = weekCounter;

                        // Determine module state
                        const isCurrent = mod.status === 'current';
                        const isCompleted = mod.status === 'completed';
                        const moduleQuote = MODULE_QUOTES[i % MODULE_QUOTES.length];

                        // Get status icon and color
                        const StatusIcon = getStatusIcon(mod.status);
                        const statusColor = getStatusColor(mod.status);

                        return (
                            <motion.div
                                key={mod.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                                className="relative pl-14 sm:pl-16 pb-10 last:pb-0 print:pb-6 print:break-inside-avoid"
                            >
                                {/* Status Icon on Timeline */}
                                <div className={`absolute left-[0.85rem] sm:left-[1.1rem] top-[1.125rem] bg-white rounded-full z-10 ${statusColor}`}>
                                    <StatusIcon 
                                        className="h-6 w-6 sm:h-7 sm:w-7" 
                                        fill={isCurrent ? 'white' : 'transparent'} 
                                    />
                                </div>

                                {/* Module Card */}
                                <div
                                    className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                                        isCurrent 
                                            ? 'border-primary/50 bg-primary/5 shadow-[0_10px_30px_rgba(99,102,241,0.1)] scale-[1.01] sm:scale-[1.02]' 
                                            : 'border-border bg-white/70 glass-panel opacity-95 hover:opacity-100'
                                    } print:shadow-none print:border-gray-200 print:bg-white`}
                                >
                                    {/* Card Header */}
                                    <div
                                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4 cursor-pointer"
                                        onClick={() => toggleModule(mod.id)}
                                    >
                                        <div className="flex-1">
                                            {/* Badges Row */}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-xs px-2.5 py-0.5 font-bold tracking-wide rounded-md ${
                                                        isCurrent 
                                                            ? 'border-primary text-primary bg-primary/10' 
                                                            : 'border-border text-muted-foreground'
                                                    }`}
                                                >
                                                    {mod.name}
                                                </Badge>
                                                <Badge 
                                                    variant="outline" 
                                                    className="text-xs px-2.5 py-0.5 font-bold tracking-wide rounded-md border-border/60 text-foreground bg-white shadow-sm"
                                                >
                                                    Week {startWeek}{endWeek > startWeek ? `–${endWeek}` : ''}
                                                </Badge>
                                                {isCurrent && (
                                                    <Badge className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                                                        <Star className="h-3 w-3 mr-1" /> Start Here
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {/* Module Title */}
                                            <h3 className="font-bold font-display text-lg sm:text-xl text-foreground tracking-tight">
                                                {mod.topic}
                                            </h3>
                                        </div>
                                        
                                        {/* Expand/Collapse Button */}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-full flex-shrink-0 self-start print:hidden"
                                        >
                                            {isModuleExpanded(mod.id) ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* Module Description */}
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-4">
                                        {mod.description}
                                    </p>

                                    {/* Module Motivational Quote */}
                                    <p className="text-xs italic text-primary/60 font-medium mb-4 pl-3 border-l-2 border-primary/20">
                                        "{moduleQuote}"
                                    </p>

                                    {/* Module Stats */}
                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground font-bold">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4 text-accent" /> {mod.hoursRequired} Hours
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Target className="h-4 w-4 text-primary" /> {mod.weeksAllocated} Week{mod.weeksAllocated > 1 ? 's' : ''}
                                        </span>
                                        {mod.sessions && (
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen className="h-4 w-4 text-green-500" /> {mod.sessions.length} Sessions
                                            </span>
                                        )}
                                        {mod.coursesInWeek && mod.coursesInWeek.length > 1 && (
                                            <span className="flex items-center gap-1.5">
                                                <GraduationCap className="h-4 w-4 text-purple-500" /> {mod.coursesInWeek.length} Courses
                                            </span>
                                        )}
                                    </div>

                                    {/* Course Transition Banners */}
                                    {mod.courseTransitions && mod.courseTransitions.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {mod.courseTransitions.map((transition, tIdx) => (
                                                <div 
                                                    key={tIdx} 
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60"
                                                >
                                                    <div className="p-1.5 rounded-full bg-green-100">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-green-800">
                                                            {transition.message}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Expanded Sessions List */}
                                    <AnimatePresence>
                                        {isModuleExpanded(mod.id) && mod.sessions && mod.sessions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-6 space-y-2 border-t border-border/50 pt-5">
                                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <Zap className="h-3.5 w-3.5 text-amber-400" /> Session-by-Session Plan
                                                    </h4>
                                                    
                                                    {mod.sessions.map((session, idx) => {
                                                        const typeInfo = getSetTypeInfo(session.setType);
                                                        const TypeIcon = typeInfo.icon;
                                                        
                                                        return (
                                                            <div 
                                                                key={session.id || idx} 
                                                                className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-border/60 hover:bg-white hover:border-primary/20 transition-all group"
                                                            >
                                                                {/* Session Type Icon */}
                                                                <div className={`p-1.5 rounded-lg flex-shrink-0 ${typeInfo.color}`}>
                                                                    <TypeIcon className="h-3.5 w-3.5" />
                                                                </div>
                                                                
                                                                {/* Session Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[10px] font-bold text-primary/70 mb-0.5 uppercase tracking-wider">
                                                                        {session.topic}
                                                                    </div>
                                                                    <div className="text-sm font-semibold text-foreground/90 truncate">
                                                                        {session.sessionName}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Session Badges and Link */}
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <Badge 
                                                                        variant="secondary" 
                                                                        className="bg-muted text-muted-foreground whitespace-nowrap text-xs"
                                                                    >
                                                                        {session.durationMins}m
                                                                    </Badge>
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className="text-[10px] px-1.5 py-0.5 border-border/40 text-muted-foreground hidden sm:inline-flex"
                                                                    >
                                                                        {typeInfo.label}
                                                                    </Badge>
                                                                    {session.ccbpUrl && (
                                                                        <a
                                                                            href={session.ccbpUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all opacity-70 group-hover:opacity-100"
                                                                            title="Open in CCBP Learning Portal"
                                                                        >
                                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* --------------------------------------------------------
                        TRACK COMPLETION CELEBRATION
                    -------------------------------------------------------- */}
                    {path.trackCompletion && path.trackCompletion.completed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: path.modules.length * 0.1 + 0.05 }}
                            className="relative pl-14 sm:pl-16 pb-10 print:pb-6 print:break-inside-avoid"
                        >
                            <div className="absolute left-[0.85rem] sm:left-[1.1rem] top-[1.125rem] bg-white rounded-full z-10">
                                <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-500 drop-shadow-[0_2px_12px_rgba(234,179,8,0.5)]" />
                            </div>
                            <div className="p-5 sm:p-6 rounded-2xl border-2 border-yellow-400/60 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">🎉</span>
                                    <h3 className="font-bold font-display text-xl text-foreground tracking-tight">
                                        Track Completed!
                                    </h3>
                                </div>
                                <p className="text-sm text-foreground/80 font-medium leading-relaxed mb-4">
                                    {path.trackCompletion.message}
                                </p>

                                {path.trackCompletion.nextTrackName && path.trackCompletion.suggestedCourses.length > 0 && (
                                    <div className="mt-4 p-4 rounded-xl bg-white/70 border border-yellow-200/60">
                                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <ArrowRight className="h-3.5 w-3.5 text-yellow-600" /> 
                                            Suggested Next Steps: {path.trackCompletion.nextTrackName}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {path.trackCompletion.suggestedCourses.map((course, idx) => (
                                                <Badge 
                                                    key={idx} 
                                                    variant="outline" 
                                                    className="bg-yellow-50 text-yellow-800 border-yellow-300 font-medium"
                                                >
                                                    {idx + 1}. {course}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* --------------------------------------------------------
                        NEXT COURSE SUGGESTION
                    -------------------------------------------------------- */}
                    {path.suggestion && (
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: path.modules.length * 0.1 + 0.1 }}
                            className="relative pl-14 sm:pl-16 pb-10 print:pb-6 print:break-inside-avoid print:hidden"
                        >
                            <div className="absolute left-[0.85rem] sm:left-[1.1rem] top-[1.125rem] bg-white rounded-full z-10">
                                <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 drop-shadow-[0_2px_10px_rgba(59,130,246,0.4)]" />
                            </div>
                            <div className="p-5 sm:p-6 rounded-2xl border-2 border-dashed border-blue-300/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 glass-panel">
                                <h3 className="font-bold font-display text-lg text-foreground tracking-tight flex items-center gap-2">
                                    <span>💡</span> What's Next?
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium mt-2 leading-relaxed">
                                    {path.suggestion.message}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200 font-bold">
                                        <GraduationCap className="h-3 w-3 mr-1" /> {path.suggestion.nextCourse}
                                    </Badge>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --------------------------------------------------------
                        FINISH LINE
                    -------------------------------------------------------- */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: path.modules.length * 0.1 + 0.2 }}
                        className="relative pl-14 sm:pl-16 pt-4 print:hidden"
                    >
                        <div className="absolute left-[0.85rem] sm:left-[1.1rem] top-[1.5rem] bg-white rounded-full z-10">
                            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]" />
                        </div>
                        <div className="p-5 sm:p-6 rounded-2xl border-2 border-dashed border-amber-300/60 bg-gradient-to-r from-amber-50/80 to-orange-50/80 glass-panel">
                            <h3 className="font-bold font-display text-lg text-foreground tracking-tight flex items-center gap-2">
                                <span>🎯</span> Goal Achieved!
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium mt-1">
                                Complete all {path.modules.length} modules and you'll be ready to conquer your{' '}
                                <span className="text-primary font-bold">{path.student.goals.primaryGoal}</span> goals!
                            </p>
                            <p className="text-xs italic text-amber-600/80 font-medium mt-3">
                                "The only impossible journey is the one you never begin." — Tony Robbins
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default PathTimeline;
