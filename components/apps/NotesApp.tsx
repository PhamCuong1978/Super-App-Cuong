import React, { useState } from 'react';
import AppContainer from '../AppContainer';
import { User } from '../../types';
import { saveFile } from '../../services/googleApiService';
import SaveIcon from '../icons/SaveIcon';

interface NotesAppProps {
  onExit: () => void;
  isVisible: boolean;
  user?: User | null;
}

const NotesApp: React.FC<NotesAppProps> = ({ onExit, isVisible, user }) => {
  const [note, setNote] = useState('This is a simple notes app. Your text is saved in the component\'s state and will be reset when you close the app. Sign in on the home screen to save your note to Google Drive.');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in on the home screen to save your note.");
      return;
    }
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      const fileName = `Note - ${new Date().toLocaleString()}`;
      await saveFile(fileName, note);
      setSaveStatus('Saved successfully!');
    } catch (error: any) {
      console.error("Save failed:", error);
      setSaveStatus(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };


  return (
    <AppContainer appName="Notes" onExit={onExit} isVisible={isVisible} user={user}>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400 hidden md:block">
                {user ? 'Authenticated & Ready to Save' : 'Sign in required to save'}
            </p>
            <div className="flex items-center space-x-2 ml-auto">
                {saveStatus && <span className="text-sm text-slate-400 transition-opacity duration-300">{saveStatus}</span>}
                <button
                    onClick={handleSave}
                    disabled={!user || isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <SaveIcon className="w-5 h-5" />
                    <span>{isSaving ? 'Saving...' : 'Save to Drive'}</span>
                </button>
            </div>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full flex-grow p-4 bg-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-lg leading-relaxed font-mono"
          placeholder="Start writing your notes here..."
        />
      </div>
    </AppContainer>
  );
};

export default NotesApp;