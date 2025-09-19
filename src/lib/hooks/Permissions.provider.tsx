'use client';

import { NublyPermissions } from '@/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// type Permissions = {
//   // Define your permission structure here
//   canViewResearch: boolean;
//   canEditProfile: boolean;
// };

type PermissionsContextType = {
  permissions: NublyPermissions | null;
  setPermissions: (perms: NublyPermissions) => void;
  clearPermissions: () => void;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined,
);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissionsState] = useState<NublyPermissions | null>(
    null,
  );

  const setPermissions = (perms: NublyPermissions) =>
    setPermissionsState(perms);
  const clearPermissions = () => setPermissionsState(null);

  return (
    <PermissionsContext.Provider
      value={{ permissions, setPermissions, clearPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
