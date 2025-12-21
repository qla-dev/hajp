import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';

const MenuRefreshContext = createContext(null);

export function MenuRefreshProvider({ children }) {
  const refreshMap = useRef({});

  const registerMenuRefresh = useCallback((key, fn) => {
    if (!key) return () => {};
    const bucket = refreshMap.current[key] ?? new Set();
    bucket.add(fn);
    refreshMap.current[key] = bucket;
    return () => {
      bucket.delete(fn);
      if (bucket.size === 0) {
        delete refreshMap.current[key];
      }
    };
  }, []);

  const triggerMenuRefresh = useCallback((key) => {
    if (!key) return;
    console.log('[menuRefresh] trigger', key);
    refreshMap.current[key]?.forEach((fn) => fn());
  }, []);

  const value = useMemo(
    () => ({
      registerMenuRefresh,
      triggerMenuRefresh,
    }),
    [registerMenuRefresh, triggerMenuRefresh],
  );

  return <MenuRefreshContext.Provider value={value}>{children}</MenuRefreshContext.Provider>;
}

export function useMenuRefresh() {
  const context = useContext(MenuRefreshContext);
  if (!context) {
    throw new Error('useMenuRefresh must be used within MenuRefreshProvider');
  }
  return context;
}
