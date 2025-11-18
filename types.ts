import React from 'react';

export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType<{ onExit: () => void; isVisible: boolean }>;
  url?: string;
  color: string;
  description: string;
}
