import React from 'react';
import { Layout, Typography, Button, Space } from 'antd';

import type { IGameRoom } from '@infection-game/shared';

const { Content } = Layout;
const { Title, Text } = Typography;

interface JoinedRoomProps {
  stateJoinedRoom: IGameRoom | null;
  actionLeaveRoom: (roomCode: string) => void;
}

const JoinedRoom: React.FC<JoinedRoomProps> = (props) => {
  const { stateJoinedRoom, actionLeaveRoom } = props;
  if (!stateJoinedRoom) {
    return null;
  }

  return (
    <Content
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        flexGrow: 1,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 32,
          minWidth: 320,
          maxWidth: 480,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: 4,
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={3} style={{ margin: 0 }}>
            Joined room
          </Title>
          <div>
            <Text type="secondary">Room code</Text>
            <br />
            <Text strong copyable>
              {stateJoinedRoom.id}
            </Text>
          </div>
          {stateJoinedRoom?.hostName ? (
            <Text type="secondary">Host: {stateJoinedRoom.hostName}</Text>
          ) : null}
          <Text>
            Waiting for another player to join. The game will start when both seats are filled.
          </Text>
          <Button danger block onClick={() => actionLeaveRoom(stateJoinedRoom.id)}>
            Leave room
          </Button>
        </Space>
      </div>
    </Content>
  );
};

export default JoinedRoom;
