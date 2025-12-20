import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import RoomInfoBottomSheet from '../components/RoomInfoBottomSheet';

const RoomSheetContext = createContext(null);

export function RoomSheetProvider({ children }) {
  const sheetRef = useRef(null);
  const [room, setRoom] = useState(null);

  const openRoomSheet = useCallback((roomData) => {
    setRoom(roomData);
    sheetRef.current?.open();
  }, []);

  const closeRoomSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleClosed = useCallback(() => {
    setRoom(null);
  }, []);

  const value = useMemo(() => ({ openRoomSheet, closeRoomSheet }), [openRoomSheet, closeRoomSheet]);

  return (
    <RoomSheetContext.Provider value={value}>
      {children}
      <RoomInfoBottomSheet ref={sheetRef} room={room} onClose={handleClosed} modalHeight={420} />
    </RoomSheetContext.Provider>
  );
}

export function useRoomSheet() {
  const context = useContext(RoomSheetContext);
  if (!context) {
    throw new Error('useRoomSheet must be used within a RoomSheetProvider');
  }
  return context;
}
