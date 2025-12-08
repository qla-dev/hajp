let headerLayout = null;
let cachedBalance = 0;
const balanceListeners = new Set();

export const setCoinHeaderLayout = (layout) => {
  if (layout && layout.width > 0 && layout.height > 0) {
    headerLayout = layout;
  }
};

export const getCoinHeaderLayout = () => headerLayout;

export const subscribeToCoinBalance = (callback) => {
  callback(cachedBalance);
  balanceListeners.add(callback);
  return () => balanceListeners.delete(callback);
};

export const updateCoinBalance = (value) => {
  const nextValue = Number.isFinite(value) ? value : cachedBalance;
  cachedBalance = nextValue;
  balanceListeners.forEach((listener) => listener(nextValue));
};

export const getCachedCoinBalance = () => cachedBalance;
