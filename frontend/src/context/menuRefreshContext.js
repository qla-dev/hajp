import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';

const MenuRefreshContext = createContext(null);

export function MenuRefreshProvider({ children }) {
  const refreshMap = useRef({});

  const registerMenuRefresh = useCallback((key, fn) => {
    if (!key) return () => {};
    refreshMap.current[key] = fn;
    return () => {
      if (refreshMap.current[key] === fn) {
        delete refreshMap.current[key];
      }
    };
  }, []);

  const triggerMenuRefresh = useCallback((key) => {
    if (!key) return;
    refreshMap.current[key]?.();
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
