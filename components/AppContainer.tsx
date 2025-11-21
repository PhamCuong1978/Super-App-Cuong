import React, { useRef } from 'react';
import { User } from '../types';

interface AppContainerProps {
  appName: string;
  onExit: () => void;
  children: React.ReactNode;
  isVisible: boolean;
  user?: User | null;
}

const AppContainer: React.FC<AppContainerProps> = ({ appName, onExit, children, isVisible, user }) => {
  const touchStartY = useRef(0);
  const SWIPE_THRESHOLD = 80; // Swipe down this many pixels to close

  const handleTouchStart = (e: React.TouchEvent) => {
    // Check if the touch is on a scrollable element and it's scrolled
    const mainContent = (e.target as HTMLElement).closest('main');
    if (mainContent && mainContent.scrollTop > 0) {
      touchStartY.current = -1; // Invalidate swipe
      return;
    }
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === -1) return; // Ignore invalidated swipes
    
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY.current > SWIPE_THRESHOLD) {
      onExit();
    }
  };

  return (
    // Backdrop: handles tap-to-exit
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onExit}
    >
      {/* App Sheet: handles content and swipe-to-exit */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`
          absolute bottom-0 left-0 right-0 flex w-full flex-col bg-slate-800 shadow-2xl h-dvh
          md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:h-auto md:max-h-[90vh] md:w-full md:max-w-4xl md:rounded-2xl
          transition-all duration-300 ease-out
          ${isVisible
            ? 'translate-y-0 opacity-100 md:-translate-x-1/2 md:-translate-y-1/2'
            : 'translate-y-full opacity-100 md:opacity-0 md:-translate-x-1/2 md:-translate-y-1/2 md:scale-95'
          }
        `}
      >
        {/* Draggable Handle: visual affordance for mobile */}
        <div className="w-full flex-shrink-0 cursor-grab py-4 md:hidden">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-600"></div>
        </div>
        
        <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-700 bg-slate-900/50 p-4 pt-0 md:pt-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">{appName}</h2>
            {user && (
               <div className="flex items-center space-x-2 px-2 py-1 bg-slate-700/50 rounded-full border border-slate-600">
                  <img src={user.picture} alt="user" className="w-5 h-5 rounded-full" />
                  <span className="text-xs text-slate-300 max-w-[100px] truncate hidden sm:inline">{user.name}</span>
               </div>
            )}
          </div>
          <button
            onClick={onExit}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </header>
        
        <main className="flex-grow flex flex-col p-4 md:p-6 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppContainer;