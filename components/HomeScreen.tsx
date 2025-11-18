import React from 'react';
import { AppDefinition } from '../types';

interface HomeScreenProps {
  apps: AppDefinition[];
  onSelectApp: (id: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ apps, onSelectApp }) => {

  const handleAppClick = (app: AppDefinition) => {
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    } else if (app.component) {
      onSelectApp(app.id);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 pt-16 md:p-8 md:pt-24">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-200 mb-4 text-center">Super App Cường</h1>
        <p className="text-lg md:text-xl text-slate-400 mb-12 text-center max-w-2xl">
            Welcome to your personal application dashboard. Click an app to launch it.
        </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-4xl">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => handleAppClick(app)}
            className="group flex flex-col items-center justify-center p-4 aspect-square bg-slate-800/50 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-slate-700/70 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
            style={{'--app-color': app.color} as React.CSSProperties}
          >
            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-xl mb-4 transition-colors duration-300 group-hover:bg-[var(--app-color)]">
              <app.icon className="w-8 h-8 md:w-10 md:h-10 text-slate-400 transition-colors duration-300 group-hover:text-white" />
            </div>
            <span className="text-sm md:text-base font-semibold text-slate-300 group-hover:text-white transition-colors duration-300 text-center">{app.name}</span>
            <span className="text-xs text-slate-500 mt-1 text-center hidden md:block">{app.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;