const listeners = new Set();

export const emitProfileUpdated = (user) => {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (error) {
      console.warn('[profileEvents] listener error', error);
    }
  });
};

export const addProfileUpdatedListener = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
