/**
 * ============================================================================
 * COMPARISON VIEW COMPONENT
 * ============================================================================
 *
 * Side-by-side comparison of 2–3 student learning paths.
 * Shows stat cards, module lists, and a grouped bar chart.
 *
 * Rendered as a modal overlay from the Coach Dashboard.
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { motion } from 'framer-motion';
import { X, Clock, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// =============================================================================
// TYPES
// =============================================================================

export interface ComparisonStudent {
  id: string;
  student_name: string;
  target_stack: string;
  program: string;
  total_weeks: number;
  modules: Array<{ topic: string; hoursRequired: number; weeksAllocated?: number }>;
  is_completed: boolean;
  created_at: string;
}

interface ComparisonViewProps {
  students: ComparisonStudent[];
  onClose: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const COLORS = ['hsl(245, 80%, 55%)', '#22c55e', '#f59e0b'];

// =============================================================================
// COMPONENT
// =============================================================================

const ComparisonView = ({ students, onClose }: ComparisonViewProps) => {
  // Summary per student
  const summaries = students.map((s) => {
    const mods = Array.isArray(s.modules) ? s.modules : [];
    return {
      name: s.student_name?.split(' ')[0] || 'Unnamed',
      full: s.student_name || 'Unnamed',
      moduleCount: mods.length,
      totalHours: mods.reduce((sum, m) => sum + (m.hoursRequired || 0), 0),
      weeks: s.total_weeks,
    };
  });

  // Grouped bar data
  const barData = [
    {
      metric: 'Modules',
      ...Object.fromEntries(summaries.map((s, i) => [`s${i}`, s.moduleCount])),
    },
    {
      metric: 'Total Hours',
      ...Object.fromEntries(summaries.map((s, i) => [`s${i}`, s.totalHours])),
    },
    {
      metric: 'Weeks',
      ...Object.fromEntries(summaries.map((s, i) => [`s${i}`, s.weeks])),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold font-display">Student Comparison</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Side-by-side stat cards */}
          <div
            className={`grid gap-4 ${
              students.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
            }`}
          >
            {students.map((s, i) => {
              const mods = Array.isArray(s.modules) ? s.modules : [];
              const hours = mods.reduce((sum, m) => sum + (m.hoursRequired || 0), 0);

              return (
                <Card key={s.id} className="border-2" style={{ borderColor: COLORS[i] }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ background: COLORS[i] }}
                      />
                      <span className="truncate">{s.student_name || 'Unnamed'}</span>
                    </CardTitle>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {s.program}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {s.target_stack.replace('-', '/').toUpperCase()}
                      </Badge>
                      {s.is_completed && (
                        <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          ✓ Done
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Mini stat grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <BookOpen className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-bold">{mods.length}</div>
                        <div className="text-[10px] text-muted-foreground">Modules</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-bold">{hours}h</div>
                        <div className="text-[10px] text-muted-foreground">Hours</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-bold">{s.total_weeks}</div>
                        <div className="text-[10px] text-muted-foreground">Weeks</div>
                      </div>
                    </div>

                    {/* Module list */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Modules
                      </h4>
                      {mods.slice(0, 6).map((m, mi) => (
                        <div
                          key={mi}
                          className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0"
                        >
                          <span className="truncate mr-2">{m.topic}</span>
                          <span className="text-muted-foreground whitespace-nowrap">
                            {m.hoursRequired}h
                          </span>
                        </div>
                      ))}
                      {mods.length > 6 && (
                        <div className="text-xs text-muted-foreground">+{mods.length - 6} more</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Grouped bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ left: 0, right: 0 }}>
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {students.map((s, i) => (
                    <Bar
                      key={s.id}
                      dataKey={`s${i}`}
                      name={summaries[i].name}
                      fill={COLORS[i]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComparisonView;
