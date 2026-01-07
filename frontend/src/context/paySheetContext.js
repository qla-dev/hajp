import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import PayBottomSheet from '../components/PayBottomSheet';

const PaySheetContext = createContext(null);

const defaultConfig = {
  title: '',
  subtitle: '',
  coinPrice: 50,
  defaultOption: 'coins',
  onPayWithCoins: null,
  onActivatePremium: null,
  onClose: null,
};

export function PaySheetProvider({ children }) {
  const sheetRef = useRef(null);
  const [config, setConfig] = useState(defaultConfig);

  const openPaySheet = useCallback((nextConfig = {}) => {
    setConfig({ ...defaultConfig, ...nextConfig });
    sheetRef.current?.open();
  }, []);

  const closePaySheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleClosed = useCallback(() => {
    config.onClose?.();
    setConfig(defaultConfig);
  }, [config]);

  const value = useMemo(
    () => ({
      openPaySheet,
      closePaySheet,
    }),
    [openPaySheet, closePaySheet],
  );

  return (
    <PaySheetContext.Provider value={value}>
      {children}
      <PayBottomSheet
        ref={sheetRef}
        title={config.title}
        subtitle={config.subtitle}
        coinPrice={config.coinPrice}
        defaultOption={config.defaultOption}
        onPayWithCoins={config.onPayWithCoins}
        onActivatePremium={config.onActivatePremium}
        onClose={handleClosed}
      />
    </PaySheetContext.Provider>
  );
}

export function usePaySheet() {
  const context = useContext(PaySheetContext);
  if (!context) {
    throw new Error('usePaySheet must be used within a PaySheetProvider');
  }
  return context;
}
