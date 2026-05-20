import React, { useEffect, useState } from 'react';
import { Modal, Typography, Button, Space } from 'antd';

import type { IGameRoom } from '@infection-game/shared';

const { Text } = Typography;

interface JoinedRoomModalProps {
  stateJoinedRoom: IGameRoom | null;
  actionLeaveRoom: (roomCode: string) => void;
}

const JoinedRoomModal: React.FC<JoinedRoomModalProps> = ({ stateJoinedRoom, actionLeaveRoom }) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [stateJoinedRoom?.id]);

  const room = stateJoinedRoom;

  return (
    <Modal
      open={room != null && !dismissed}
      title="Joined room"
      footer={null}
      closable
      maskClosable
      onCancel={() => setDismissed(true)}
    >
      {room ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">Room code</Text>
            <br />
            <Text strong copyable>
              {room.id}
            </Text>
          </div>
          {room.hostName ? <Text type="secondary">Host: {room.hostName}</Text> : null}
          <Text>
            Waiting for another player to join. The game will start when both seats are filled.
          </Text>
          <Button danger block onClick={() => actionLeaveRoom(room.id)}>
            Leave room
          </Button>
        </Space>
      ) : null}
    </Modal>
  );
};

export default JoinedRoomModal;
