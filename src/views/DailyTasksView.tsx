
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { DailyTask, DailyTaskStatus } from '../types';
import TaskItem from '../components/TaskItem';
import { useTheme } from '../contexts/ThemeContext';

interface DailyTasksViewProps {
  tasks: DailyTask[];
  onAddTask: (taskText: string, date: string) => void;
  onUpdateTaskStatus: (taskId: string, status: DailyTaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNotes: (taskId: string) => void;
}

const DailyTasksView: React.FC<DailyTasksViewProps> = ({ tasks, onAddTask, onUpdateTaskStatus, onDeleteTask, onOpenNotes }) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTaskText, setNewTaskText] = useState('');

  const todayDateString = useMemo(() => currentDate.toISOString().split('T')[0], [currentDate]);

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => task.date === todayDateString);
  }, [tasks, todayDateString]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    onAddTask(newTaskText, todayDateString);
    setNewTaskText('');
  };

  const changeDate = (offset: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + offset);
      return newDate;
    });
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(currentDate);

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${theme === 'light' ? 'text-slate-900' : 'text-white'} h-full flex flex-col`}>
      <header className="mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>Daily Tasks</h1>
        <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} mt-2`}>Manage your tasks for the day.</p>
      </header>

      {/* Date Navigation */}
      <div className={`flex items-center justify-between mb-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800/50'} p-3 rounded-lg`}>
        <button onClick={() => changeDate(-1)} className={`p-2 rounded-md ${theme === 'light' ? 'hover:bg-slate-200' : 'hover:bg-slate-700'} transition-colors`}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center font-semibold text-lg">
          <Calendar className={`w-5 h-5 mr-2 ${theme === 'light' ? 'text-indigo-500' : 'text-sky-400'}`} />
          <span>{formattedDate}</span>
        </div>
        <button onClick={() => changeDate(1)} className={`p-2 rounded-md ${theme === 'light' ? 'hover:bg-slate-200' : 'hover:bg-slate-700'} transition-colors`}>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          className={`flex-grow ${theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-300'} border rounded-lg px-4 py-2 focus:ring-2 ${theme === 'light' ? 'focus:ring-indigo-500' : 'focus:ring-sky-500'} focus:outline-none transition`}
        />
        <button type="submit" className={`${theme === 'light' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-sky-500 hover:bg-sky-600'} text-white p-2 rounded-lg transition-colors flex items-center justify-center`}>
          <Plus className="w-6 h-6" />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-3">
          {tasksForSelectedDate.length > 0 ? (
            tasksForSelectedDate.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdateStatus={onUpdateTaskStatus}
                onDelete={onDeleteTask}
                onOpenNotes={onOpenNotes}
              />
            ))
          ) : (
            <div className={`text-center py-8 px-4 border-2 border-dashed ${theme === 'light' ? 'border-slate-300' : 'border-slate-700'} rounded-lg`}>
              <p className={`${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>No tasks for this day.</p>
              <p className={`${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Add a task above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTasksView;
