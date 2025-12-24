import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import RoomInfoBottomSheet from '../components/RoomInfoBottomSheet';
import InviteCodeBottomSheet from '../components/InviteCodeBottomSheet';

const RoomSheetContext = createContext(null);

export function RoomSheetProvider({ children }) {
  const sheetRef = useRef(null);
  const [room, setRoom] = useState(null);
  const inviteSheetRef = useRef(null);
  const [inviteCallback, setInviteCallback] = useState(null);
  const [leaveCallback, setLeaveCallback] = useState(null);
  const [roomInviteCallback, setRoomInviteCallback] = useState(null);
  const [actionButtonFlag, setActionButtonFlag] = useState(0);
  const [acceptCallback, setAcceptCallback] = useState(null);

  const openRoomSheet = useCallback((roomData, onLeaveCallback, onInviteCallback, actionFlag = 0, onAcceptCallback = null) => {
    setRoom(roomData);
    setLeaveCallback(() => onLeaveCallback ?? null);
    setRoomInviteCallback(() => onInviteCallback ?? null);
    setActionButtonFlag(actionFlag || 0);
    setAcceptCallback(() => onAcceptCallback ?? null);
    sheetRef.current?.open();
  }, []);

  const closeRoomSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleClosed = useCallback(() => {
    setRoom(null);
    setLeaveCallback(null);
    setRoomInviteCallback(null);
    setActionButtonFlag(0);
    setAcceptCallback(null);
  }, []);

  const openInviteSheet = useCallback((callback) => {
    setInviteCallback(() => callback);
    inviteSheetRef.current?.open();
  }, []);

  const closeInviteSheet = useCallback(() => {
    inviteSheetRef.current?.close();
  }, []);

  const value = useMemo(
    () => ({
      openRoomSheet,
      closeRoomSheet,
      openInviteSheet,
      closeInviteSheet,
    }),
    [openRoomSheet, closeRoomSheet, openInviteSheet, closeInviteSheet],
  );

  return (
    <RoomSheetContext.Provider value={value}>
      {children}
        <RoomInfoBottomSheet
          ref={sheetRef}
          room={room}
          onClose={handleClosed}
          onLeaveSuccess={leaveCallback}
          modalHeight={420}
          onInviteFriends={roomInviteCallback}
          actionButtonFlag={actionButtonFlag}
          onAcceptSuccess={acceptCallback}
        />
        <InviteCodeBottomSheet
          ref={inviteSheetRef}
          onJoinSuccess={() => {
            inviteCallback?.();
            setInviteCallback(null);
          }}
          onClose={() => {
            setInviteCallback(null);
          }}
        />
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
