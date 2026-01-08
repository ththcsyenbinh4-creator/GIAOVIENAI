'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FloatingActionsContextType {
  actionButton: ReactNode | null;
  setActionButton: (button: ReactNode | null) => void;
}

const FloatingActionsContext = createContext<FloatingActionsContextType | null>(null);

export function FloatingActionsProvider({ children }: { children: ReactNode }) {
  const [actionButton, setActionButton] = useState<ReactNode | null>(null);

  return (
    <FloatingActionsContext.Provider value={{ actionButton, setActionButton }}>
      {children}
    </FloatingActionsContext.Provider>
  );
}

export function useFloatingActions() {
  const context = useContext(FloatingActionsContext);
  if (!context) {
    throw new Error('useFloatingActions must be used within FloatingActionsProvider');
  }
  return context;
}
