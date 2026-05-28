'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEYS = {
  left: 'workspace-sidebar-collapsed',
  right: 'workspace-settings-sidebar-collapsed',
} as const;

export type WorkspaceSidebarSide = keyof typeof STORAGE_KEYS;

export function useSidebarCollapsed(side: WorkspaceSidebarSide = 'left') {
  const storageKey = STORAGE_KEYS[side];
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'true') {
      setCollapsed(true);
    }
    setHydrated(true);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, String(next));
      return next;
    });
  }, [storageKey]);

  const expand = useCallback(() => {
    setCollapsed(false);
    localStorage.setItem(storageKey, 'false');
  }, [storageKey]);

  return { collapsed: hydrated ? collapsed : false, toggle, expand, hydrated };
}
