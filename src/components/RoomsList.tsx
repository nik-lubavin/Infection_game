import React from 'react';
import { Typography, Card, Row, Col, Button, List, Tag, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import type { IRoomSummary, RoomStatus } from '@infection-game/shared';
import SocketConnectionStatus from './SocketConnectionStatus';
const { Text } = Typography;

const STATUS_COLOR: Record<RoomStatus, string> = {
  waiting: 'gold',
  playing: 'green',
  finished: 'default',
};

export interface RoomsListProps {
  /** Room the player is in; null in the lobby. */
  yourRoomId: string | null;
  connectionError: string | null;
  roomList: IRoomSummary[];
  socketConnected: boolean;
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (roomCode: string) => void;
  actionLeaveRoom: (roomCode: string) => void;
}

const RoomsList: React.FC<RoomsListProps> = (props) => {
  const {
    yourRoomId,
    connectionError,
    roomList,
    socketConnected,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  } = props;
  const inLobby = yourRoomId === null;

  return (
    <Card
      title="Server rooms"
      bordered={false}
      extra={
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={actionListRooms}
          aria-label="Refresh room list"
        />
      }
      style={{ marginBottom: '20px' }}
    >
      <Row style={{ marginBottom: 8 }} gutter={[8, 8]}>
        <Col span={24}>
          <SocketConnectionStatus
            socketConnected={socketConnected}
            connectionError={connectionError}
          />
        </Col>
        {inLobby && (
          <Col span={24}>
            <Button type="primary" block disabled={!socketConnected} onClick={actionCreateRoom}>
              Create room
            </Button>
          </Col>
        )}
      </Row>
      {roomList.length === 0 ? (
        <Text type="secondary">No open rooms</Text>
      ) : (
        <List
          size="small"
          dataSource={roomList}
          renderItem={(room: IRoomSummary) => {
            const inThisRoom = room.id === yourRoomId;
            const canConnect =
              socketConnected && inLobby && room.status === 'waiting' && !room.hasGuest;
            // Own layout instead of List.Item `actions`: their 48px indent pushes the button
            // out of the narrow sidebar.
            const action = inThisRoom ? (
              <Button
                type="link"
                danger
                size="small"
                onClick={() => actionLeaveRoom(room.id)}
                aria-label={`Disconnect from room ${room.id}`}
              >
                Disconnect room
              </Button>
            ) : canConnect ? (
              <Button
                type="link"
                size="small"
                onClick={() => actionJoinRoom(room.id)}
                aria-label={`Connect to room ${room.id}`}
              >
                Connect
              </Button>
            ) : null;

            return (
              <List.Item style={inThisRoom ? { backgroundColor: '#fffbe6' } : undefined}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  <Space size={4} wrap style={{ flex: 1, minWidth: 0 }}>
                    <Tag color="gray">{room.id}</Tag>
                    <Text>{room.hostName}</Text>
                    <Tag color={STATUS_COLOR[room.status]}>{room.status}</Tag>
                  </Space>
                  {action}
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default RoomsList;
