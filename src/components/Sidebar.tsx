import React, { useState, useRef } from 'react';
import { PlayerType } from '../interfaces/Board';
import { useSocketContext } from '../contexts/SocketContext';
import GameStatusCard from './GameStatusCard';
import RoomsList from './RoomsList';

interface SidebarProps {
  currentPlayer: PlayerType;
  movesLeft: number;
  availableCellCodes: string[];
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPlayer,
  movesLeft,
  availableCellCodes,
  collapsed,
}) => {
  const [width, setWidth] = useState(300);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const {
    stateRoomList,
    socketConnected,
    connectionError,
    actionListRooms,
    actionCreateRoom,
    actionLeaveRoom,
    socketId,
  } = useSocketContext();

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current && sidebarRef.current) {
      const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > 80 && newWidth < 600) {
        // Set min and max width
        setWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      style={{
        width: collapsed ? 80 : width,
        height: '100vh',
        backgroundColor: '#fff',
        borderRight: '1px solid #f0f0f0',
        padding: collapsed ? '20px 10px' : '20px',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '5px',
          cursor: 'col-resize',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
        onMouseDown={handleMouseDown}
      />
      {!collapsed && (
        <>
          <GameStatusCard
            currentPlayer={currentPlayer}
            movesLeft={movesLeft}
            availableCellCodes={availableCellCodes}
          />
          <RoomsList
            stateRoomList={stateRoomList}
            socketConnected={socketConnected}
            connectionError={connectionError}
            actionListRooms={actionListRooms}
            actionCreateRoom={actionCreateRoom}
            actionLeaveRoom={actionLeaveRoom}
            socketId={socketId}
          />
        </>
      )}

      {collapsed && (
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px' }}>
            {currentPlayer === 'red' ? '🔴' : '🔵'}
          </div>
          <div style={{ fontSize: '10px' }}>{movesLeft}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
