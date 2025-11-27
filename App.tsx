
import React, { useState } from 'react';
import { AppDefinition, User } from './types';
import { useAuth } from './hooks/useAuth'; // Import the auth module
import HomeScreen from './components/HomeScreen';
import NotesApp from './components/apps/NotesApp';
import WeatherApp from './components/apps/WeatherApp';
import GeminiChatApp from './components/apps/GeminiChatApp';
import NotesIcon from './components/icons/NotesIcon';
import WeatherIcon from './components/icons/WeatherIcon';
import ScaleIcon from './components/icons/ScaleIcon';
import ChatIcon from './components/icons/ChatIcon';
import MeetingIcon from './components/icons/MeetingIcon';
import BusinessPlanIcon from './components/icons/BusinessPlanIcon';
import BankIcon from './components/icons/BankIcon';
import NotebookLMIcon from './components/icons/NotebookLMIcon';

const APPS: AppDefinition[] = [
  {
    id: 'meeting-minutes',
    name: 'Biên bản họp',
    icon: MeetingIcon,
    url: 'https://bien-ban-hop.vercel.app/',
    color: '#0d9488',
    description: 'Meeting Assistant'
  },
  {
    id: 'business-plan',
    name: 'Phương án kinh doanh',
    icon: BusinessPlanIcon,
    url: 'https://kehoach-kd-cuong.vercel.app/',
    color: '#16a34a',
    description: 'Business Consultant'
  },
  {
    id: 'bank-digital',
    name: 'Chuyển đổi sổ Bank',
    icon: BankIcon,
    url: 'https://vr-2-1-bank-statement-accounting-co.vercel.app/',
    color: '#2563eb',
    description: 'Finance Tech Expert'
  },
  {
    id: 'notebook-lm',
    name: 'Notebook LM Clone',
    icon: NotebookLMIcon,
    url: 'https://notebook-lm-cuong.vercel.app/',
    color: '#9333ea',
    description: 'AI-Powered Notes'
  },
  {
    id: 'chat',
    name: 'Gemini Chat',
    icon: ChatIcon,
    component: GeminiChatApp,
    color: '#4f46e5',
    description: 'AI Assistant'
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: NotesIcon,
    component: NotesApp,
    color: '#d97706',
    description: 'Quick Memos'
  },
  {
    id: 'calculator',
    name: 'Kế toán Online',
    icon: ScaleIcon,
    url: 'https://vr-1-0-ketoan-online.vercel.app/',
    color: '#64748b',
    description: 'Accounting Tools'
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: WeatherIcon,
    component: WeatherApp,
    color: '#0ea5e9',
    description: 'Forecast'
  },
];

const App: React.FC = () => {
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  // Use the Auth module for user tracking
  const { user, signIn, signOut, isLoading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      alert(`Could not sign in: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const handleSelectApp = (id: string) => {
    setActiveAppId(id);
  };
  
  const handleExitApp = () => {
    setActiveAppId(null);
  };
  
  // Display a loading screen while checking authentication status
  if (isLoading) {
      return (
          <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 bg-grid-slate-700/[0.2] relative overflow-hidden">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="relative w-full h-full overflow-y-auto">
            <div className={`transition-all duration-500 ease-in-out ${activeAppId ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <HomeScreen 
                  apps={APPS} 
                  onSelectApp={handleSelectApp}
                  user={user}
                  onSignIn={handleSignIn}
                  onSignOut={signOut}
                />
            </div>

            {APPS.filter(app => app.component).map(app => {
                 const AppComponent = app.component!;
                 // Pass user to all components now, since AppContainer uses it
                 const props: { key: string; onExit: () => void; isVisible: boolean; user?: User | null } = {
                     key: app.id,
                     onExit: handleExitApp,
                     isVisible: activeAppId === app.id,
                     user: user
                 };
                 return <AppComponent {...props} />;
            })}
        </div>
    </div>
  );
};

export default App;
