/**
 * ============================================================================
 * ACTIVITY LOG COMPONENT
 * ============================================================================
 *
 * Slide-out panel that shows an audit trail of coach actions.
 * Actions tracked: view, delete, complete, reopen, pin, unpin,
 * tag-add, tag-remove, bulk-delete, bulk-complete, export.
 *
 * Data is persisted in localStorage via coachHelpers.
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getActivityLog,
  clearActivityLog,
  type ActivityEntry,
} from '@/lib/coachHelpers';

// =============================================================================
// TYPES
// =============================================================================

interface ActivityLogProps {
  open: boolean;
  onClose: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ACTION_STYLES: Record<string, { label: string; color: string }> = {
  view:            { label: '👁 Viewed',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  delete:          { label: '🗑 Deleted',        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  complete:        { label: '✅ Completed',      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  reopen:          { label: '↩ Reopened',        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  pin:             { label: '📌 Pinned',         color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  unpin:           { label: '📌 Unpinned',       color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  'tag-add':       { label: '🏷 Tagged',         color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  'tag-remove':    { label: '🏷 Untagged',       color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  'bulk-delete':   { label: '🗑 Bulk Delete',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  'bulk-complete': { label: '✅ Bulk Complete',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  export:          { label: '📥 Exported',       color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  report:          { label: '📊 Report',         color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
};

// =============================================================================
// HELPERS
// =============================================================================

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

// =============================================================================
// COMPONENT
// =============================================================================

const ActivityLog = ({ open, onClose }: ActivityLogProps) => {
  const [log, setLog] = useState<ActivityEntry[]>(() => getActivityLog());
  const [filterAction, setFilterAction] = useState<string>('all');

  // Re-read log whenever the panel opens
  const refreshLog = () => setLog(getActivityLog());

  const filtered =
    filterAction === 'all' ? log : log.filter((e) => e.action === filterAction);

  const uniqueActions = [...new Set(log.map((e) => e.action))];

  const handleClear = () => {
    clearActivityLog();
    setLog([]);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl border-l"
          onClick={(e) => e.stopPropagation()}
          onAnimationComplete={refreshLog}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold font-display flex items-center gap-2">
              <Clock className="h-5 w-5" /> Activity Log
            </h2>
            <div className="flex items-center gap-2">
              {log.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Filter chips */}
          {uniqueActions.length > 1 && (
            <div className="flex flex-wrap gap-1.5 p-3 border-b overflow-x-auto">
              <Badge
                variant={filterAction === 'all' ? 'default' : 'outline'}
                className="cursor-pointer text-xs shrink-0"
                onClick={() => setFilterAction('all')}
              >
                All ({log.length})
              </Badge>
              {uniqueActions.map((a) => (
                <Badge
                  key={a}
                  variant={filterAction === a ? 'default' : 'outline'}
                  className="cursor-pointer text-xs shrink-0"
                  onClick={() => setFilterAction(a)}
                >
                  {ACTION_STYLES[a]?.label || a}
                </Badge>
              ))}
            </div>
          )}

          {/* Entries */}
          <div className="overflow-y-auto h-[calc(100vh-130px)] p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  {log.length === 0 ? 'No activity recorded yet' : 'No entries for this filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((entry) => {
                  const style = ACTION_STYLES[entry.action] || {
                    label: entry.action,
                    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                  };
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <Badge className={`text-[10px] shrink-0 ${style.color}`}>
                        {style.label}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{entry.target}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivityLog;
