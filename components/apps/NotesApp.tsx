import React, { useState } from 'react';
import AppContainer from '../AppContainer';

interface NotesAppProps {
  onExit: () => void;
  isVisible: boolean;
}

const NotesApp: React.FC<NotesAppProps> = ({ onExit, isVisible }) => {
  const [note, setNote] = useState('This is a simple notes app. Your text is saved in the component\'s state and will be reset when you close the app.');

  return (
    <AppContainer appName="Notes" onExit={onExit} isVisible={isVisible}>
      <div className="flex flex-col flex-grow">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full flex-grow p-4 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-lg leading-relaxed"
          placeholder="Start writing your notes here..."
        />
      </div>
    </AppContainer>
  );
};

export default NotesApp;