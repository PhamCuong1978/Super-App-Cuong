import React from 'react';

export interface User {
  name: string;
  email: string;
  picture?: string;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType<{ onExit: () => void; isVisible: boolean; user?: User | null }>;
  url?: string;
  color: string;
  description: string;
}