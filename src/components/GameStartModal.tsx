import React, { useEffect, useState } from 'react';
import { Avatar, Button, Modal, Space, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { opponentOf, type IGameRoom, type RoomPlayerSide } from '@infection-game/shared';

const { Text } = Typography;

const SIDE_LABEL: Record<RoomPlayerSide, string> = { red: 'Red', blue: 'Blue' };

interface SeatProps {
  side: RoomPlayerSide;
  /** Name of the player in the seat; null for an empty seat. */
  playerName: string | null;
  isYou: boolean;
}

const Seat: React.FC<SeatProps> = ({ side, playerName, isYou }) => {
  const empty = playerName === null;
  return (
    <div
      aria-label={empty ? `${SIDE_LABEL[side]} seat, empty` : `${SIDE_LABEL[side]} seat`}
      style={{
        flex: 1,
        minWidth: 0,
        padding: 16,
        borderRadius: 8,
        border: empty ? '1px dashed #d9d9d9' : '1px solid #f0f0f0',
        textAlign: 'center',
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Tag color={side} style={{ marginInlineEnd: 0 }}>
          {SIDE_LABEL[side]}
        </Tag>
        {empty ? (
          <>
            <Avatar size={48} icon={<UserOutlined />} />
            <Text type="secondary">Waiting for player…</Text>
          </>
        ) : (
          <>
            <Avatar size={48} style={{ backgroundColor: side }}>
              {playerName.charAt(0)}
            </Avatar>
            <Text strong ellipsis>
              {playerName}
              {isYou ? ' (you)' : ''}
            </Text>
          </>
        )}
      </Space>
    </div>
  );
};

interface GameStartModalProps {
  room: IGameRoom | null;
  /** Side of the current player; the modal stays closed while it is unknown. */
  yourSide: RoomPlayerSide | null;
  playerName: string;
  actionLeaveRoom: (roomCode: string) => void;
}

/** Game start form: the current player's seat is filled, the opponent's seat stays empty. */
const GameStartModal: React.FC<GameStartModalProps> = ({
  room,
  yourSide,
  playerName,
  actionLeaveRoom,
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [room?.id]);

  if (room === null || yourSide === null) return null;

  const you: SeatProps = { side: yourSide, playerName, isYou: true };
  const opponent: SeatProps = { side: opponentOf(yourSide), playerName: null, isYou: false };
  // Red seat on the left, blue on the right.
  const [left, right] = yourSide === 'red' ? [you, opponent] : [opponent, you];

  return (
    <Modal open={!dismissed} title="New game" footer={null} onCancel={() => setDismissed(true)}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">Room code</Text>
          <br />
          <Text strong copyable>
            {room.id}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Seat {...left} />
          <Text type="secondary">vs</Text>
          <Seat {...right} />
        </div>
        <Text type="secondary">The game starts when the second player joins.</Text>
        <Button danger block onClick={() => actionLeaveRoom(room.id)}>
          Leave room
        </Button>
      </Space>
    </Modal>
  );
};

export default GameStartModal;
