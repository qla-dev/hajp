import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';

const HomeRefreshContext = createContext(null);

export function HomeRefreshProvider({ children }) {
  const refreshRef = useRef(null);

  const registerHomeRefresh = useCallback((fn) => {
    refreshRef.current = fn;
    return () => {
      if (refreshRef.current === fn) {
        refreshRef.current = null;
      }
    };
  }, []);

  const triggerHomeRefresh = useCallback(() => {
    refreshRef.current?.();
  }, []);

  const value = useMemo(
    () => ({
      registerHomeRefresh,
      triggerHomeRefresh,
    }),
    [registerHomeRefresh, triggerHomeRefresh],
  );

  return <HomeRefreshContext.Provider value={value}>{children}</HomeRefreshContext.Provider>;
}

export function useHomeRefresh() {
  const context = useContext(HomeRefreshContext);
  if (!context) {
    throw new Error('useHomeRefresh must be used within HomeRefreshProvider');
  }
  return context;
}
