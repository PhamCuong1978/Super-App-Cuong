import React, { useState } from 'react';
import { AppDefinition } from './types';
import HomeScreen from './components/HomeScreen';
import NotesApp from './components/apps/NotesApp';
import WeatherApp from './components/apps/WeatherApp';
import CalculatorApp from './components/apps/CalculatorApp';
import GeminiChatApp from './components/apps/GeminiChatApp';
import NotesIcon from './components/icons/NotesIcon';
import WeatherIcon from './components/icons/WeatherIcon';
import CalculatorIcon from './components/icons/CalculatorIcon';
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
    url: 'https://aistudio.google.com/apps/drive/14fLTUR6QUdxie3FJd4IRVGZHOOEc_tA8?showPreview=true&showAssistant=true',
    color: '#0d9488',
    description: 'Meeting Assistant'
  },
  {
    id: 'business-plan',
    name: 'Phương án kinh doanh',
    icon: BusinessPlanIcon,
    url: 'https://aistudio.google.com/apps/drive/1_F_WvWOenDPo4UyHiSt7ExIIZe5aTmcd?showPreview=true&showAssistant=true',
    color: '#16a34a',
    description: 'Business Consultant'
  },
  {
    id: 'bank-digital',
    name: 'Chuyển đổi sổ Bank',
    icon: BankIcon,
    url: 'https://aistudio.google.com/apps/drive/1acRun2kBNVBfQKtx-1tLqT-pR2rOvq2x?showPreview=true&showAssistant=true',
    color: '#2563eb',
    description: 'Finance Tech Expert'
  },
  {
    id: 'notebook-lm',
    name: 'Notebook LM Clone',
    icon: NotebookLMIcon,
    url: 'https://aistudio.google.com/apps/drive/1Jvk9DVf8pV4Sfw-TrZZQKIZwD9QkMsYZ?showPreview=true&showAssistant=true',
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
    name: 'Calculator',
    icon: CalculatorIcon,
    component: CalculatorApp,
    color: '#64748b',
    description: 'Calculations'
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
  
  const handleSelectApp = (id: string) => {
    setActiveAppId(id);
  };
  
  const handleExitApp = () => {
    setActiveAppId(null);
  };
  
  return (
    <div className="h-screen w-screen bg-slate-900 bg-grid-slate-700/[0.2] relative overflow-hidden">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="relative w-full h-full overflow-y-auto">
            <div className={`transition-all duration-500 ease-in-out ${activeAppId ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <HomeScreen apps={APPS} onSelectApp={handleSelectApp} />
            </div>

            {APPS.filter(app => app.component).map(app => {
                 const AppComponent = app.component!;
                 return <AppComponent key={app.id} onExit={handleExitApp} isVisible={activeAppId === app.id} />;
            })}
        </div>
    </div>
  );
};

export default App;