
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface TaskNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskText: string;
  currentNotes: string;
  onSaveNotes: (newNotes: string) => void;
}

const TaskNotesModal: React.FC<TaskNotesModalProps> = ({ isOpen, onClose, taskText, currentNotes, onSaveNotes }) => {
  const [notes, setNotes] = useState(currentNotes);

  useEffect(() => {
    setNotes(currentNotes);
  }, [currentNotes]);

  const handleSave = () => {
    onSaveNotes(notes);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Notes for: ${taskText}`}>
      <div className="p-1 text-slate-200">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes here..."
          className="w-full h-48 p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none transition resize-none"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg shadow-sm bg-slate-600 hover:bg-slate-700 text-white font-semibold transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-4 rounded-lg shadow-sm bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-all">
            Save Notes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskNotesModal;
