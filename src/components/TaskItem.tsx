
import React from 'react';
import { Check, X, FileText, Trash2, Play } from 'lucide-react';
import { DailyTask, DailyTaskStatus } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { TASK_STATUS_STYLES_LIGHT, TASK_STATUS_STYLES_DARK } from '../constants';

interface TaskItemProps {
  task: DailyTask;
  onUpdateStatus: (taskId: string, status: DailyTaskStatus) => void;
  onOpenNotes: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdateStatus, onOpenNotes, onDelete }) => {
  const { theme } = useTheme();
  const styles = theme === 'light' ? TASK_STATUS_STYLES_LIGHT : TASK_STATUS_STYLES_DARK;
  const statusStyle = styles[task.status] || styles.pending;

  return (
    <div className={`flex items-center p-3 ${theme === 'light' ? 'bg-white' : 'bg-slate-900/70'} rounded-lg border-l-4 ${statusStyle.border}`}>
      <p className={`flex-grow truncate mr-4 ${statusStyle.text}`}>{task.text}</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onUpdateStatus(task.id, DailyTaskStatus.Ongoing)} className={`p-2 rounded-md ${styles.ongoing.buttonHover} ${styles.ongoing.text} transition-colors`}>
          <Play className="w-5 h-5" />
        </button>
        <button onClick={() => onUpdateStatus(task.id, DailyTaskStatus.Completed)} className={`p-2 rounded-md ${styles.completed.buttonHover} ${styles.completed.text} transition-colors`}>
          <Check className="w-5 h-5" />
        </button>
        <button onClick={() => onUpdateStatus(task.id, DailyTaskStatus.Dropped)} className={`p-2 rounded-md ${styles.dropped.buttonHover} ${styles.dropped.text} transition-colors`}>
          <X className="w-5 h-5" />
        </button>
        <button onClick={() => onOpenNotes(task.id)} className={`p-2 rounded-md ${styles.pending.buttonHover} ${styles.pending.text} transition-colors`}>
          <FileText className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(task.id)} className={`p-2 rounded-md ${styles.dropped.buttonHover} ${styles.dropped.text} transition-colors`}>
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
