/**
 * ============================================================================
 * PATH TIMELINE COMPONENT — Clean Table Format
 * ============================================================================
 *
 * Displays the generated learning path as simple, readable tables.
 * Each module is a collapsible card with a session table inside.
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
    ArrowLeft,
    Target,
    Download,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    BookOpen,
    Rocket,
    Trophy,
    Zap,
    GraduationCap,
    Save,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

interface PathTimelineProps {
    path: LearningPathData;
    onBack: () => void;
    onHome: () => void;
    onSave?: () => Promise<void>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PROGRAM_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
    basic: { label: 'Basic', color: 'bg-green-100 text-green-700', emoji: '🌱' },
    academy: { label: 'Academy', color: 'accent-gradient text-white', emoji: '🚀' },
    intensive: { label: 'Intensive', color: 'bg-red-100 text-red-700', emoji: '🔥' },
};

/** Human-friendly session type labels */
function getTypeLabel(setType?: string): string {
    if (!setType) return 'Learn';
    const map: Record<string, string> = {
        LEARNING_SET: 'Learn',
        PRACTICE: 'Practice',
        QUESTION_SET: 'Practice',
        QUIZ: 'Quiz',
        EXAM: 'Exam',
        CODING_PRACTICE: 'Code',
        PROJECT: 'Project',
        ASSESSMENT: 'Assess',
    };
    return map[setType] || 'Learn';
}

/** Color class for each type */
function getTypeBadgeClass(setType?: string): string {
    if (!setType) return 'bg-blue-50 text-blue-600 border-blue-200';
    const map: Record<string, string> = {
        LEARNING_SET: 'bg-blue-50 text-blue-600 border-blue-200',
        PRACTICE: 'bg-green-50 text-green-600 border-green-200',
        QUESTION_SET: 'bg-green-50 text-green-600 border-green-200',
        QUIZ: 'bg-amber-50 text-amber-600 border-amber-200',
        EXAM: 'bg-purple-50 text-purple-600 border-purple-200',
        CODING_PRACTICE: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        PROJECT: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        ASSESSMENT: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return map[setType] || 'bg-blue-50 text-blue-600 border-blue-200';
}

// =============================================================================
// COMPONENT
// =============================================================================

const PathTimeline = ({ path, onBack, onHome, onSave }: PathTimelineProps) => {
    // STATE
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
        // Auto-expand the first module
        const init: Record<string, boolean> = {};
        if (path.modules.length > 0) init[path.modules[0].id] = true;
        return init;
    });
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // COMPUTED
    const prog = PROGRAM_LABELS[path.program] ?? PROGRAM_LABELS.basic;
    const totalSessions = path.modules.reduce((s, m) => s + (m.sessions?.length || 0), 0);
    const totalHours = path.modules.reduce((s, m) => s + (m.hoursRequired || 0), 0);

    // HANDLERS
    const toggleModule = (id: string) =>
        setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));

    const isExpanded = (id: string) => isPrinting || !!expandedModules[id];

    const handleExportPDF = () => {
        const all: Record<string, boolean> = {};
        path.modules.forEach((m) => (all[m.id] = true));
        setExpandedModules(all);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 300);
    };

    // Track week counter for labels
    let weekCounter = 0;

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div className="min-h-screen bg-gray-50 text-foreground print:bg-white print:text-black">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">

                {/* ── TOP NAV ─────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 mb-6 print:hidden">
                    <Button variant="ghost" onClick={onBack} className="font-semibold rounded-xl px-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
                    </Button>
                    <Button variant="outline" onClick={onHome} className="font-semibold rounded-xl px-4">
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
                                        toast.success('🎉 Path saved!');
                                    } catch {
                                        toast.error('Failed to save. Try again.');
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaved || isSaving}
                                className={`font-bold rounded-xl px-4 shadow-md ${
                                    isSaved
                                        ? 'bg-green-600 text-white'
                                        : 'accent-gradient text-white border-0'
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
                        <Button onClick={handleExportPDF} className="bg-primary text-white font-bold rounded-xl px-4 shadow-md hover:bg-primary/90">
                            <Download className="mr-2 h-4 w-4" /> Export PDF
                        </Button>
                    </div>
                </div>

                {/* ── SUMMARY CARD ────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm print:shadow-none"
                >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            {prog.emoji} {path.student.profile.name}'s Learning Plan
                        </h1>
                        <Badge className={`${prog.color} px-3 py-1 text-sm font-bold rounded-full`}>
                            {prog.label}
                        </Badge>
                    </div>

                    <p className="text-gray-500 text-sm font-medium mb-5">
                        Course: <span className="text-primary font-bold">{path.student.goals.courseName}</span>
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Modules', value: path.modules.length, icon: BookOpen, color: 'text-indigo-600' },
                            { label: 'Sessions', value: totalSessions, icon: Target, color: 'text-green-600' },
                            { label: 'Total Hours', value: totalHours, icon: Clock, color: 'text-amber-600' },
                            { label: 'Weeks', value: path.totalWeeks, icon: Zap, color: 'text-purple-600' },
                        ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <stat.icon className={`h-5 w-5 ${stat.color} flex-shrink-0`} />
                                <div>
                                    <div className="text-xl font-extrabold">{stat.value}</div>
                                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── MODULE CARDS WITH SESSION TABLES ─────────────────── */}
                <div className="space-y-4">
                    {path.modules.map((mod, i) => {
                        const startWeek = weekCounter + 1;
                        weekCounter += mod.weeksAllocated;
                        const endWeek = weekCounter;
                        const weekLabel = endWeek > startWeek ? `Week ${startWeek}–${endWeek}` : `Week ${startWeek}`;

                        return (
                            <motion.div
                                key={mod.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden print:break-inside-avoid"
                            >
                                {/* Module Header — clickable */}
                                <button
                                    type="button"
                                    onClick={() => toggleModule(mod.id)}
                                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
                                >
                                    {/* Numbered circle */}
                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                                        {i + 1}
                                    </div>

                                    {/* Title & meta */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-bold truncate">{mod.topic}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400 font-medium">
                                            <span>{weekLabel}</span>
                                            <span>•</span>
                                            <span>{mod.hoursRequired} hrs</span>
                                            <span>•</span>
                                            <span>{mod.sessions?.length ?? 0} sessions</span>
                                        </div>
                                    </div>

                                    {/* Chevron */}
                                    <div className="flex-shrink-0 print:hidden">
                                        {isExpanded(mod.id) ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded: session table */}
                                <AnimatePresence>
                                    {isExpanded(mod.id) && mod.sessions && mod.sessions.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            {/* Desktop table */}
                                            <div className="hidden sm:block overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-t border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider">
                                                            <th className="py-2 px-4 w-10">#</th>
                                                            <th className="py-2 px-4">Topic</th>
                                                            <th className="py-2 px-4">Session</th>
                                                            <th className="py-2 px-4 w-24">Type</th>
                                                            <th className="py-2 px-4 w-20 text-right">Duration</th>
                                                            <th className="py-2 px-4 w-16 text-center">Link</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {mod.sessions.map((session, idx) => (
                                                            <tr
                                                                key={session.id || idx}
                                                                className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                                                            >
                                                                <td className="py-2.5 px-4 text-gray-300 font-medium">{idx + 1}</td>
                                                                <td className="py-2.5 px-4 text-primary/80 font-semibold text-xs uppercase tracking-wide">{session.topic}</td>
                                                                <td className="py-2.5 px-4 font-medium text-gray-700">{session.sessionName}</td>
                                                                <td className="py-2.5 px-4">
                                                                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getTypeBadgeClass(session.setType)}`}>
                                                                        {getTypeLabel(session.setType)}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2.5 px-4 text-right text-gray-500">{session.durationMins}m</td>
                                                                <td className="py-2.5 px-4 text-center">
                                                                    {session.ccbpUrl ? (
                                                                        <a
                                                                            href={session.ccbpUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                                                            title="Open in CCBP"
                                                                        >
                                                                            <ExternalLink className="h-4 w-4" />
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-gray-300">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile: simple card stack */}
                                            <div className="sm:hidden divide-y divide-gray-100 border-t border-gray-100">
                                                {mod.sessions.map((session, idx) => (
                                                    <div key={session.id || idx} className="p-4 flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 text-[11px] font-bold flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] uppercase tracking-wider font-semibold text-primary/70">{session.topic}</p>
                                                            <p className="text-sm font-medium text-gray-800 leading-snug">{session.sessionName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getTypeBadgeClass(session.setType)}`}>
                                                                    {getTypeLabel(session.setType)}
                                                                </span>
                                                                <span className="text-xs text-gray-400">{session.durationMins}m</span>
                                                            </div>
                                                        </div>
                                                        {session.ccbpUrl && (
                                                            <a
                                                                href={session.ccbpUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 rounded-lg text-primary hover:bg-primary/10 flex-shrink-0"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── TRACK COMPLETION ─────────────────────────────────── */}
                {path.trackCompletion && path.trackCompletion.completed && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: path.modules.length * 0.06 + 0.05 }}
                        className="mt-6 p-5 rounded-2xl border-2 border-yellow-300 bg-yellow-50 print:break-inside-avoid"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            <h3 className="text-lg font-bold">🎉 Track Completed!</h3>
                        </div>
                        <p className="text-sm text-gray-600">{path.trackCompletion.message}</p>
                        {path.trackCompletion.nextTrackName && path.trackCompletion.suggestedCourses.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase w-full mb-1">Suggested Next →</span>
                                {path.trackCompletion.suggestedCourses.map((c, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                        {idx + 1}. {c}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── NEXT SUGGESTION ─────────────────────────────────── */}
                {path.suggestion && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: path.modules.length * 0.06 + 0.1 }}
                        className="mt-4 p-5 rounded-2xl border border-blue-200 bg-blue-50 print:hidden"
                    >
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-blue-500" /> What's Next?
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{path.suggestion.message}</p>
                        <Badge className="mt-2 bg-blue-100 text-blue-700 border border-blue-200 font-bold">
                            <GraduationCap className="h-3 w-3 mr-1" /> {path.suggestion.nextCourse}
                        </Badge>
                    </motion.div>
                )}

                {/* ── FINISH ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: path.modules.length * 0.06 + 0.15 }}
                    className="mt-4 mb-10 p-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50 text-center print:hidden"
                >
                    <Trophy className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="text-base font-bold">🎯 You've got this!</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Complete all {path.modules.length} modules to achieve your learning goals.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default PathTimeline;
