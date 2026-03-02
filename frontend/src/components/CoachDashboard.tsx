/**
 * ============================================================================
 * COACH DASHBOARD COMPONENT (v2)
 * ============================================================================
 *
 * Comprehensive coach dashboard for managing and monitoring student paths.
 *
 * FEATURES:
 *  1. Search & Filter (name, stack, program, status)
 *  2. Sort Students (date, name, weeks, program — asc / desc)
 *  3. Bulk Actions (select multiple → delete / mark complete)
 *  4. Student Comparison (side-by-side 2–3 students)
 *  5. Dashboard Report Export (styled printable HTML)
 *  6. Real-time Polling (30 s auto-refresh, toast on new)
 *  7. Pin / Star Students (localStorage)
 *  8. Student Tags / Labels (localStorage, colour-coded)
 *  9. Duplicate Detection (same-name banner)
 * 10. Dark Mode Toggle (Tailwind class strategy)
 * 11. Activity Audit Log (localStorage)
 * 12. CSV Export
 * 13. Charts (donut, radar, weekly line)
 * 14. Drill-down → StudentPathDetail
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Clock,
  BookOpen,
  LogOut,
  FolderOpen,
  Trash2,
  CheckCircle2,
  Search,
  FileDown,
  Filter,
  XCircle,
  PieChart as PieChartIcon,
  ArrowUpDown,
  Star,
  Tag,
  GitCompare,
  FileText,
  Sun,
  Moon,
  History,
  AlertTriangle,
  X,
  Square,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import StudentPathDetail, { type StudentPathRecord } from '@/components/StudentPathDetail';
import ComparisonView from '@/components/ComparisonView';
import ActivityLog from '@/components/ActivityLog';
import {
  getPinnedIds,
  togglePin as togglePinHelper,
  getTagsForStudent,
  addTagToStudent,
  removeTagFromStudent,
  TAG_PRESETS,
  type StudentTag,
  logActivity,
  getStoredTheme,
  setStoredTheme,
  type ThemeMode,
  initTheme,
} from '@/lib/coachHelpers';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface CoachDashboardProps {
  onBack: () => void;
}

interface StudentPath extends StudentPathRecord {
  current_skill_level: number;
  is_completed: boolean;
  modules: Array<{
    topic: string;
    hoursRequired: number;
    weeksAllocated?: number;
    description?: string;
  }>;
}

type SortField = 'date' | 'name' | 'weeks' | 'program';
type SortDir = 'asc' | 'desc';

// =============================================================================
// CONSTANTS
// =============================================================================

const PROGRAM_COLORS: Record<string, string> = {
  basic: 'bg-success/10 text-success border-success/20',
  academy: 'bg-primary/10 text-primary border-primary/20',
  intensive: 'bg-destructive/10 text-destructive border-destructive/20',
};

const PROGRAM_ORDER: Record<string, number> = { basic: 0, academy: 1, intensive: 2 };

const STACK_OPTIONS = [
  { value: 'all', label: 'All Stacks' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'ai-ml', label: 'AI / ML' },
  { value: 'dsa', label: 'DSA' },
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
];

const PROGRAM_OPTIONS = [
  { value: 'all', label: 'All Programs' },
  { value: 'basic', label: 'Basic' },
  { value: 'academy', label: 'Academy' },
  { value: 'intensive', label: 'Intensive' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'date', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'weeks', label: 'Total Weeks' },
  { value: 'program', label: 'Program' },
];

const DONUT_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-3))'];

// =============================================================================
// SKELETON COMPONENTS
// =============================================================================

const StatCardSkeleton = () => (
  <Card className="card-elevated">
    <CardContent className="p-5">
      <Skeleton className="h-5 w-5 mb-3 rounded" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

const StudentRowSkeleton = () => (
  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Export filtered students to CSV. */
function exportStudentsToCSV(students: StudentPath[]) {
  const header = 'Name,Stack,Program,Total Weeks,Completed,Created At\n';
  const rows = students.map((s) =>
    [
      `"${(s.student_name || 'Unnamed').replace(/"/g, '""')}"`,
      s.target_stack,
      s.program,
      s.total_weeks,
      s.is_completed ? 'Yes' : 'No',
      new Date(s.created_at).toLocaleDateString(),
    ].join(','),
  );
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Build "paths generated per week" data for the line chart. */
function buildWeeklyLineData(students: StudentPath[]) {
  const weekMap: Record<string, number> = {};
  students.forEach((s) => {
    const d = new Date(s.created_at);
    if (isNaN(d.getTime())) return;
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7,
    );
    const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    weekMap[key] = (weekMap[key] || 0) + 1;
  });
  return Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));
}

/** Generate a printable HTML dashboard report. */
function generateDashboardReport(students: StudentPath[]) {
  const completed = students.filter((s) => s.is_completed).length;
  const inProgress = students.length - completed;
  const pct = students.length ? Math.round((completed / students.length) * 100) : 0;

  const programCounts = { basic: 0, academy: 0, intensive: 0 };
  students.forEach((s) => {
    if (s.program in programCounts) programCounts[s.program as keyof typeof programCounts]++;
  });

  const stackCounts: Record<string, number> = {};
  students.forEach((s) => {
    stackCounts[s.target_stack] = (stackCounts[s.target_stack] || 0) + 1;
  });

  const html = `<!DOCTYPE html>
<html><head>
<title>Coach Dashboard Report — ${new Date().toLocaleDateString()}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1f2937}
  h1{font-size:24px;margin-bottom:4px}
  .sub{color:#6b7280;font-size:14px;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center}
  .stat .val{font-size:28px;font-weight:700}
  .stat .lbl{font-size:12px;color:#6b7280}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb}
  th{background:#f3f4f6;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
  .badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:500}
  .bg-green{background:#dcfce7;color:#166534} .bg-blue{background:#dbeafe;color:#1e40af}
  .bg-red{background:#fee2e2;color:#991b1b} .bg-gray{background:#f3f4f6;color:#374151}
  .footer{margin-top:32px;color:#9ca3af;font-size:12px;text-align:center;border-top:1px solid #e5e7eb;padding-top:12px}
</style>
</head><body>
<h1>📊 Coach Dashboard Report</h1>
<p class="sub">Generated ${new Date().toLocaleString()} · ${students.length} student${students.length !== 1 ? 's' : ''}</p>

<div class="grid">
  <div class="stat"><div class="val">${students.length}</div><div class="lbl">Total Students</div></div>
  <div class="stat"><div class="val">${pct}%</div><div class="lbl">Completion Rate</div></div>
  <div class="stat"><div class="val">${completed}</div><div class="lbl">Completed</div></div>
  <div class="stat"><div class="val">${inProgress}</div><div class="lbl">In Progress</div></div>
</div>

<div class="grid">
  <div class="stat"><div class="val">${programCounts.basic}</div><div class="lbl">Basic</div></div>
  <div class="stat"><div class="val">${programCounts.academy}</div><div class="lbl">Academy</div></div>
  <div class="stat"><div class="val">${programCounts.intensive}</div><div class="lbl">Intensive</div></div>
  <div class="stat"><div class="val">${Object.keys(stackCounts).length}</div><div class="lbl">Stacks</div></div>
</div>

<h2>Stack Distribution</h2>
<table><tr>${Object.entries(stackCounts).map(([s, c]) => `<td><strong>${s.toUpperCase()}</strong><br/>${c} student${c !== 1 ? 's' : ''}</td>`).join('')}</tr></table>

<h2 style="margin-top:24px">All Students</h2>
<table>
<thead><tr><th>Name</th><th>Stack</th><th>Program</th><th>Weeks</th><th>Status</th><th>Created</th></tr></thead>
<tbody>
${students.map((s) => `<tr>
  <td>${s.student_name || 'Unnamed'}</td>
  <td>${s.target_stack.toUpperCase()}</td>
  <td><span class="badge ${s.program === 'basic' ? 'bg-green' : s.program === 'intensive' ? 'bg-red' : 'bg-blue'}">${s.program}</span></td>
  <td>${s.total_weeks}</td>
  <td>${s.is_completed ? '<span class="badge bg-green">✓ Completed</span>' : '<span class="badge bg-gray">In Progress</span>'}</td>
  <td>${new Date(s.created_at).toLocaleDateString()}</td>
</tr>`).join('\n')}
</tbody></table>

<div class="footer">Student Accelerator · Coach Dashboard Report</div>
</body></html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const CoachDashboard = ({ onBack }: CoachDashboardProps) => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // ---- Core view state ----
  const [selectedStudent, setSelectedStudent] = useState<StudentPath | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentPath | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Filter state ----
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStack, setFilterStack] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // ---- Sort state ----
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ---- Bulk selection ----
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // ---- Comparison ----
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // ---- Pins ----
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => getPinnedIds());

  // ---- Tags ----
  const [tagsMap, setTagsMap] = useState<Record<string, StudentTag[]>>({});
  const [tagPopoverId, setTagPopoverId] = useState<string | null>(null);

  // ---- Dark mode ----
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // ---- Activity log ----
  const [showActivityLog, setShowActivityLog] = useState(false);

  // ---- Polling ----
  const prevCountRef = useRef<number>(0);

  // Initialise theme on mount
  useEffect(() => {
    initTheme();
  }, []);

  // Toggle dark mode
  const handleToggleTheme = useCallback(() => {
    const next: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setStoredTheme(next);
  }, [theme]);

  // ---- Fetch student paths (with 30 s polling) ----
  const {
    data: students = [],
    isLoading: loading,
    isError,
  } = useQuery<StudentPath[]>({
    queryKey: ['coach', 'students'],
    queryFn: async () => {
      const res = await api.get('/api/student/all');
      return res.data as StudentPath[];
    },
    staleTime: 20_000,
    refetchInterval: 30_000, // 🔄 Real-time polling
  });

  // Load tags for all students
  useEffect(() => {
    if (students.length === 0) return;
    const map: Record<string, StudentTag[]> = {};
    students.forEach((s) => {
      const tags = getTagsForStudent(s.id);
      if (tags.length > 0) map[s.id] = tags;
    });
    setTagsMap(map);
  }, [students]);

  // Toast when new students arrive (polling)
  useEffect(() => {
    if (loading) return;
    if (prevCountRef.current > 0 && students.length > prevCountRef.current) {
      const diff = students.length - prevCountRef.current;
      toast.info(`🔔 ${diff} new student path${diff > 1 ? 's' : ''} detected!`, {
        duration: 4000,
      });
    }
    prevCountRef.current = students.length;
  }, [students.length, loading]);

  // ---- Derived: filtered & sorted students ----
  const filteredStudents = useMemo(() => {
    let list = [...students];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => (s.student_name || '').toLowerCase().includes(q));
    }

    // Stack filter
    if (filterStack !== 'all') {
      list = list.filter((s) => s.target_stack === filterStack);
    }

    // Program filter
    if (filterProgram !== 'all') {
      list = list.filter((s) => s.program === filterProgram);
    }

    // Status filter
    if (filterStatus === 'completed') {
      list = list.filter((s) => s.is_completed);
    } else if (filterStatus === 'in-progress') {
      list = list.filter((s) => !s.is_completed);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = (a.student_name || '').localeCompare(b.student_name || '');
          break;
        case 'weeks':
          cmp = a.total_weeks - b.total_weeks;
          break;
        case 'program':
          cmp = (PROGRAM_ORDER[a.program] ?? 1) - (PROGRAM_ORDER[b.program] ?? 1);
          break;
        case 'date':
        default:
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    // Pinned students always on top
    const pinSet = new Set(pinnedIds);
    const pinned = list.filter((s) => pinSet.has(s.id));
    const unpinned = list.filter((s) => !pinSet.has(s.id));
    return [...pinned, ...unpinned];
  }, [students, searchQuery, filterStack, filterProgram, filterStatus, sortField, sortDir, pinnedIds]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterStack !== 'all' ||
    filterProgram !== 'all' ||
    filterStatus !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStack('all');
    setFilterProgram('all');
    setFilterStatus('all');
  };

  // ---- Duplicate detection ----
  const duplicates = useMemo(() => {
    const nameCounts: Record<string, number> = {};
    students.forEach((s) => {
      const name = (s.student_name || '').trim().toLowerCase();
      if (name) nameCounts[name] = (nameCounts[name] || 0) + 1;
    });
    return new Set(
      Object.entries(nameCounts)
        .filter(([, count]) => count > 1)
        .map(([name]) => name),
    );
  }, [students]);

  const hasDuplicates = duplicates.size > 0;

  // ---- Charts data ----
  const radarData = [
    { subject: 'Frontend', value: students.filter((s) => ['frontend', 'fullstack'].includes(s.target_stack)).length },
    { subject: 'Backend', value: students.filter((s) => ['backend', 'fullstack'].includes(s.target_stack)).length },
    { subject: 'AI/ML', value: students.filter((s) => s.target_stack === 'ai-ml').length },
    { subject: 'DSA', value: students.filter((s) => s.target_stack === 'dsa').length },
    { subject: 'SQL', value: students.filter((s) => s.target_stack === 'sql').length },
    { subject: 'Python', value: students.filter((s) => s.target_stack === 'python').length },
  ];

  const completedCount = students.filter((s) => s.is_completed).length;
  const inProgressCount = students.length - completedCount;
  const donutData = [
    { name: 'Completed', value: completedCount },
    { name: 'In Progress', value: inProgressCount },
  ];
  const completionPct = students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0;

  const weeklyData = useMemo(() => buildWeeklyLineData(students), [students]);

  const stats = [
    { label: 'Total Students', value: students.length.toString(), icon: Users },
    { label: 'Basic Program', value: students.filter((s) => s.program === 'basic').length.toString(), icon: BookOpen },
    { label: 'Academy', value: students.filter((s) => s.program === 'academy').length.toString(), icon: TrendingUp },
    { label: 'Intensive', value: students.filter((s) => s.program === 'intensive').length.toString(), icon: Clock },
  ];

  // ---- Handlers ----
  const handleSignOut = async () => {
    logout();
    onBack();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const idToDelete = deleteTarget.id;
    setDeleting(true);
    try {
      await api.delete(`/api/student/${idToDelete}`);
      logActivity('delete', deleteTarget.student_name || 'Unnamed');
    } catch (err) {
      console.error('Failed to delete path on server:', err);
    }
    setDeleteTarget(null);
    setDeleting(false);
    queryClient.setQueryData<StudentPath[]>(
      ['coach', 'students'],
      (old) => old?.filter((s) => s.id !== idToDelete) ?? [],
    );
    if (selectedStudent?.id === idToDelete) setSelectedStudent(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(idToDelete);
      return next;
    });
  };

  const handleCompletionChange = (id: string, completed: boolean) => {
    api.patch(`/api/student/${id}/complete`, { is_completed: completed }).catch((err: unknown) => {
      console.error('Failed to toggle completion on server:', err);
    });
    const student = students.find((s) => s.id === id);
    logActivity(completed ? 'complete' : 'reopen', student?.student_name || 'Unnamed');

    queryClient.setQueryData<StudentPath[]>(
      ['coach', 'students'],
      (old) => old?.map((s) => (s.id === id ? { ...s, is_completed: completed } : s)) ?? [],
    );
    if (selectedStudent?.id === id) {
      setSelectedStudent((prev) => (prev ? { ...prev, is_completed: completed } : null));
    }
  };

  // ---- Bulk actions ----
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = [...selectedIds];
    const names = ids
      .map((id) => students.find((s) => s.id === id)?.student_name || 'Unnamed')
      .join(', ');

    for (const id of ids) {
      try {
        await api.delete(`/api/student/${id}`);
      } catch (err) {
        console.error(`Bulk delete failed for ${id}:`, err);
      }
    }
    logActivity('bulk-delete', `${ids.length} students: ${names}`);

    queryClient.setQueryData<StudentPath[]>(
      ['coach', 'students'],
      (old) => old?.filter((s) => !selectedIds.has(s.id)) ?? [],
    );
    setSelectedIds(new Set());
    setBulkDeleting(false);
    setShowBulkDeleteDialog(false);
    toast.success(`Removed ${ids.length} student path${ids.length > 1 ? 's' : ''}`);
  };

  const handleBulkComplete = async () => {
    const ids = [...selectedIds];
    const names = ids
      .map((id) => students.find((s) => s.id === id)?.student_name || 'Unnamed')
      .join(', ');

    for (const id of ids) {
      api.patch(`/api/student/${id}/complete`, { is_completed: true }).catch(console.error);
    }
    logActivity('bulk-complete', `${ids.length} students: ${names}`);

    queryClient.setQueryData<StudentPath[]>(
      ['coach', 'students'],
      (old) => old?.map((s) => (selectedIds.has(s.id) ? { ...s, is_completed: true } : s)) ?? [],
    );
    setSelectedIds(new Set());
    toast.success(`Marked ${ids.length} path${ids.length > 1 ? 's' : ''} as completed`);
  };

  // ---- Pin ----
  const handleTogglePin = (id: string) => {
    const wasPinned = pinnedIds.includes(id);
    const updated = togglePinHelper(id);
    setPinnedIds(updated);
    const student = students.find((s) => s.id === id);
    logActivity(wasPinned ? 'unpin' : 'pin', student?.student_name || 'Unnamed');
  };

  // ---- Tags ----
  const handleAddTag = (studentId: string, tag: StudentTag) => {
    const updated = addTagToStudent(studentId, tag);
    setTagsMap((prev) => ({ ...prev, [studentId]: updated }));
    const student = students.find((s) => s.id === studentId);
    logActivity('tag-add', `"${tag.label}" → ${student?.student_name || 'Unnamed'}`);
  };

  const handleRemoveTag = (studentId: string, tagLabel: string) => {
    const updated = removeTagFromStudent(studentId, tagLabel);
    setTagsMap((prev) => ({ ...prev, [studentId]: updated }));
    const student = students.find((s) => s.id === studentId);
    logActivity('tag-remove', `"${tagLabel}" from ${student?.student_name || 'Unnamed'}`);
  };

  // ---- Comparison ----
  const toggleCompareId = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast.warning('You can compare up to 3 students');
        return prev;
      }
      return [...prev, id];
    });
  };

  // ---- Student selection ----
  const handleSelectStudent = (student: StudentPath) => {
    if (compareMode) {
      toggleCompareId(student.id);
      return;
    }
    setSelectedStudent(student);
    logActivity('view', student.student_name || 'Unnamed');
  };

  // ---- Export report ----
  const handleExportReport = () => {
    generateDashboardReport(students);
    logActivity('report', `Dashboard report (${students.length} students)`);
  };

  const handleExportCSV = () => {
    exportStudentsToCSV(students);
    logActivity('export', `CSV export (${students.length} students)`);
  };

  // ========================================================================
  // DRILL-DOWN VIEW
  // ========================================================================

  if (selectedStudent) {
    return (
      <StudentPathDetail
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
        onCompletionChange={handleCompletionChange}
      />
    );
  }

  // ========================================================================
  // COMPARISON VIEW
  // ========================================================================

  if (showComparison && compareIds.length >= 2) {
    const compareStudents = compareIds
      .map((id) => students.find((s) => s.id === id))
      .filter(Boolean) as StudentPath[];

    return (
      <ComparisonView
        students={compareStudents}
        onClose={() => {
          setShowComparison(false);
          setCompareMode(false);
          setCompareIds([]);
        }}
      />
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  const allSelected = filteredStudents.length > 0 && selectedIds.size === filteredStudents.length;
  const someSelected = selectedIds.size > 0;
  const pinSet = new Set(pinnedIds);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-6 py-10 max-w-6xl">
        {/* ---- TOP BAR ---- */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Home
          </Button>
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Activity log */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowActivityLog(true)}
              title="Activity Log"
            >
              <History className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* ---- TITLE ---- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold font-display mb-1">Coach Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            Your students' learning paths — private to your account
          </p>
        </motion.div>

        {/* ---- DUPLICATE WARNING ---- */}
        {hasDuplicates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Duplicate names detected:</strong>{' '}
                {[...duplicates].map((n) => `"${n}"`).join(', ')} — these students have multiple
                saved paths.
              </span>
            </div>
          </motion.div>
        )}

        {/* ---- STAT CARDS ---- */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : stats.map((stat, i) => (
                <Card key={i} className="card-elevated card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold font-display">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
        </motion.div>

        {/* ---- SEARCH / FILTER / SORT / EXPORT BAR ---- */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Stack filter */}
                <Select value={filterStack} onValueChange={setFilterStack}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Stack" />
                  </SelectTrigger>
                  <SelectContent>
                    {STACK_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Program filter */}
                <Select value={filterProgram} onValueChange={setFilterProgram}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Program" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {SORT_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => {
                          if (sortField === opt.value) {
                            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                          } else {
                            setSortField(opt.value);
                            setSortDir('desc');
                          }
                        }}
                        className="flex justify-between"
                      >
                        {opt.label}
                        {sortField === opt.value && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {sortDir === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>

              {/* Second row: action buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {/* Export CSV */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleExportCSV}
                  disabled={students.length === 0}
                >
                  <FileDown className="h-3.5 w-3.5" />
                  CSV
                </Button>

                {/* Export Report */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleExportReport}
                  disabled={students.length === 0}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Report
                </Button>

                {/* Compare toggle */}
                <Button
                  variant={compareMode ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setCompareMode(!compareMode);
                    setCompareIds([]);
                  }}
                  disabled={students.length < 2}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  {compareMode ? `Compare (${compareIds.length})` : 'Compare'}
                </Button>

                {/* Launch comparison */}
                {compareMode && compareIds.length >= 2 && (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowComparison(true)}
                  >
                    View Comparison
                  </Button>
                )}

                {hasActiveFilters && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    {filteredStudents.length} of {students.length}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- BULK ACTIONS BAR ---- */}
        {someSelected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleBulkComplete}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ---- MAIN GRID ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display">Student Paths</CardTitle>
                {filteredStudents.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="text-xs gap-1.5"
                  >
                    {allSelected ? (
                      <CheckSquare className="h-3.5 w-3.5" />
                    ) : (
                      <Square className="h-3.5 w-3.5" />
                    )}
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <StudentRowSkeleton key={i} />
                    ))}
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <p className="text-sm text-destructive">
                      Failed to load students. Please try again later.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        queryClient.invalidateQueries({ queryKey: ['coach', 'students'] })
                      }
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="p-4 rounded-full bg-muted">
                      <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {students.length === 0 ? 'No students yet' : 'No matching students'}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {students.length === 0
                          ? 'Go to Home → Start Your Journey to generate a learning path. It will automatically appear here.'
                          : "Try adjusting your search or filters to find what you're looking for."}
                      </p>
                    </div>
                    {students.length === 0 ? (
                      <Button variant="outline" size="sm" onClick={onBack}>
                        Generate First Path
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map((student) => {
                      const isPinned = pinSet.has(student.id);
                      const isSelected = selectedIds.has(student.id);
                      const isCompareSelected = compareIds.includes(student.id);
                      const studentTags = tagsMap[student.id] || [];
                      const isDuplicate = duplicates.has(
                        (student.student_name || '').trim().toLowerCase(),
                      );

                      return (
                        <div
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all gap-3 cursor-pointer group ${
                            isCompareSelected
                              ? 'bg-primary/10 border-2 border-primary/30'
                              : isSelected
                                ? 'bg-primary/5 border border-primary/20'
                                : 'bg-muted/50 hover:bg-muted border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Checkbox */}
                            {!compareMode && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelectOne(student.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0"
                              />
                            )}

                            {/* Compare radio */}
                            {compareMode && (
                              <div
                                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isCompareSelected
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`}
                              >
                                {isCompareSelected && (
                                  <span className="text-[10px] text-primary-foreground font-bold">
                                    {compareIds.indexOf(student.id) + 1}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Pin star */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(student.id);
                              }}
                              className={`flex-shrink-0 transition-colors ${
                                isPinned
                                  ? 'text-amber-500'
                                  : 'text-muted-foreground/30 hover:text-amber-400'
                              }`}
                              title={isPinned ? 'Unpin student' : 'Pin to top'}
                            >
                              <Star
                                className="h-4 w-4"
                                fill={isPinned ? 'currentColor' : 'none'}
                              />
                            </button>

                            {/* Avatar */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0 ${
                                student.is_completed ? 'bg-success' : 'accent-gradient'
                              }`}
                            >
                              {student.is_completed ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : student.student_name ? (
                                student.student_name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)
                              ) : (
                                '??'
                              )}
                            </div>

                            {/* Name + info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm group-hover:underline truncate">
                                  {student.student_name || 'Unnamed Student'}
                                </span>
                                {isDuplicate && (
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {student.target_stack.replace('-', '/').toUpperCase()} •{' '}
                                {student.total_weeks} weeks
                                {student.is_completed && (
                                  <span className="ml-2 text-success font-medium">✓ Completed</span>
                                )}
                              </div>
                              {/* Tags */}
                              {studentTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {studentTags.map((tag) => (
                                    <span
                                      key={tag.label}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                      style={{
                                        backgroundColor: tag.color + '20',
                                        color: tag.color,
                                      }}
                                    >
                                      {tag.label}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveTag(student.id, tag.label);
                                        }}
                                        className="hover:opacity-70"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right side: badge, date, actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${PROGRAM_COLORS[student.program]}`}
                            >
                              {student.program}
                            </Badge>
                            <div className="text-xs text-muted-foreground hidden sm:block">
                              {new Date(student.created_at).toLocaleDateString()}
                            </div>

                            {/* Tag popover */}
                            <Popover
                              open={tagPopoverId === student.id}
                              onOpenChange={(open) =>
                                setTagPopoverId(open ? student.id : null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTagPopoverId(
                                      tagPopoverId === student.id ? null : student.id,
                                    );
                                  }}
                                  title="Add tag"
                                >
                                  <Tag className="h-3.5 w-3.5" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-48 p-2"
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">
                                  Assign Tag
                                </p>
                                <div className="space-y-1">
                                  {TAG_PRESETS.map((preset) => {
                                    const hasTag = studentTags.some(
                                      (t) => t.label === preset.label,
                                    );
                                    return (
                                      <button
                                        key={preset.label}
                                        onClick={() => {
                                          if (hasTag) {
                                            handleRemoveTag(student.id, preset.label);
                                          } else {
                                            handleAddTag(student.id, preset);
                                          }
                                        }}
                                        className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors ${
                                          hasTag ? 'bg-muted font-medium' : ''
                                        }`}
                                      >
                                        <span
                                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: preset.color }}
                                        />
                                        {preset.label}
                                        {hasTag && <span className="ml-auto">✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(student);
                              }}
                              aria-label="Delete student path"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ---- RIGHT SIDEBAR: CHARTS ---- */}
          <div className="space-y-6">
            {/* Completion Rate Donut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="card-elevated">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display flex items-center gap-2 text-base">
                    <PieChartIcon className="h-4 w-4" /> Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-[180px]">
                      <Skeleton className="h-[140px] w-[140px] rounded-full" />
                    </div>
                  ) : students.length === 0 ? (
                    <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground text-center">
                      No data yet
                    </div>
                  ) : (
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {donutData.map((_, i) => (
                              <Cell key={i} fill={DONUT_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              `${value} student${value !== 1 ? 's' : ''}`,
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-2xl font-bold font-display">{completionPct}%</div>
                          <div className="text-[10px] text-muted-foreground">Completed</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {students.length > 0 && (
                    <div className="flex justify-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: DONUT_COLORS[0] }}
                        />
                        Completed ({completedCount})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: DONUT_COLORS[1] }}
                        />
                        In Progress ({inProgressCount})
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Stack Distribution Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="font-display">Stack Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <Skeleton className="h-[200px] w-[200px] rounded-full" />
                    </div>
                  ) : students.length === 0 ? (
                    <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground text-center">
                      Chart will appear after generating student paths
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Radar
                            name="Students"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Number of students per stack
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ---- PATHS GENERATED PER WEEK — Line Chart ---- */}
        {students.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" /> Paths Generated per Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyData.length < 2 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    The trend chart will appear once students are added across multiple weeks.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [
                          `${v} path${v !== 1 ? 's' : ''}`,
                          'Generated',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ---- DELETE SINGLE DIALOG ---- */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this student path?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the learning path for{' '}
                {deleteTarget?.student_name || 'this student'}. You can't undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Removing…' : 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ---- BULK DELETE DIALOG ---- */}
        <AlertDialog
          open={showBulkDeleteDialog}
          onOpenChange={(open) => !open && setShowBulkDeleteDialog(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Remove {selectedIds.size} student path{selectedIds.size > 1 ? 's' : ''}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the selected learning paths. You can't undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {bulkDeleting ? 'Removing…' : `Remove ${selectedIds.size}`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ---- ACTIVITY LOG PANEL ---- */}
        <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} />
      </div>
    </div>
  );
};

export default CoachDashboard;
