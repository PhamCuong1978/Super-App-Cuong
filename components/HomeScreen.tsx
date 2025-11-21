
import React, { useState, useEffect } from 'react';
import { AppDefinition, User } from '../types';
import GoogleIcon from './icons/GoogleIcon';

interface HomeScreenProps {
  apps: AppDefinition[];
  onSelectApp: (id: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

const StatusBar: React.FC<{ user: User | null; onSignIn: () => void; onSignOut: () => void; }> = ({ user, onSignIn, onSignOut }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-between bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="text-slate-400 text-sm font-mono border-r border-slate-600 pr-4">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></div>
                     <span className="text-sm text-slate-300 font-medium">
                        {user ? 'System Online' : 'Guest Mode'}
                     </span>
                </div>
            </div>

            {user ? (
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-white">{user.name}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                    </div>
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-blue-500/50" />
                    <button 
                      onClick={onSignOut} 
                      className="px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
                    >
                      Sign Out
                    </button>
                </div>
            ) : (
                <button 
                    onClick={onSignIn} 
                    className="flex items-center space-x-3 px-5 py-2 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-lg group"
                >
                    <GoogleIcon className="w-5 h-5 group-hover:animate-bounce" />
                    <span>Sign in with Google</span>
                </button>
            )}
        </div>
    );
};


const HomeScreen: React.FC<HomeScreenProps> = ({ apps, onSelectApp, user, onSignIn, onSignOut }) => {

  return (
    <div className="p-4 pt-8 md:p-8 md:pt-12 relative min-h-full flex flex-col items-center">
      
      <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 text-center tracking-tight">Super App Cường</h1>
      <p className="text-lg md:text-xl text-slate-400 mb-8 text-center max-w-2xl">
          Your central hub for productivity and AI tools.
      </p>

      <StatusBar user={user} onSignIn={onSignIn} onSignOut={onSignOut} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
        {apps.map((app) => {
          const commonClasses = "group flex flex-col items-center justify-center p-4 aspect-square bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700/50 shadow-lg transition-all duration-300 hover:bg-slate-700/80 hover:scale-105 hover:shadow-2xl hover:border-[var(--app-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer no-underline";
          const style = {'--app-color': app.color} as React.CSSProperties;

          const content = (
            <>
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-2xl mb-3 transition-colors duration-300 group-hover:bg-[var(--app-color)] shadow-inner">
                <app.icon className="w-7 h-7 md:w-9 md:h-9 text-slate-400 transition-colors duration-300 group-hover:text-white" />
              </div>
              <span className="text-sm md:text-base font-semibold text-slate-300 group-hover:text-white transition-colors duration-300 text-center">{app.name}</span>
            </>
          );

          // If the app has a URL, render it as a proper Anchor <a> tag.
          // This is crucial for mobile devices to reliably open new tabs without popup blockers.
          if (app.url) {
            return (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className={commonClasses}
                style={style}
              >
                {content}
              </a>
            );
          }

          // Otherwise, render as a button for internal navigation
          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className={commonClasses}
              style={style}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HomeScreen;
