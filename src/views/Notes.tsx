
import React from 'react';
import PersonalNotesView from '../components/PersonalNotesView';

interface NotesProps {
  globalNotes: string;
  setGlobalNotes: (notes: string) => void;
}

const Notes: React.FC<NotesProps> = ({ globalNotes, setGlobalNotes }) => {
  return (
    <PersonalNotesView initialNotes={globalNotes} onSaveNotes={setGlobalNotes} />
  );
};

export default Notes;
