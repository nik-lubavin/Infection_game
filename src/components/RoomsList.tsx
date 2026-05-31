import React from 'react';
import { Typography, Card, Row, Col, Button, List, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import type { IGameRoom } from '@infection-game/shared';
import SocketConnectionStatus from './SocketConnectionStatus';
const { Text } = Typography;

export interface RoomsListProps {
  playerId: string;
  connectionError: string | null;
  roomList: IGameRoom[];
  socketConnected: boolean;
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionJoinRoom: (room: IGameRoom) => void;
  actionLeaveRoom: (roomCode: string) => void;
}

const RoomsList: React.FC<RoomsListProps> = (props) => {
  const {
    playerId,
    connectionError,
    roomList,
    socketConnected,
    actionListRooms,
    actionCreateRoom,
    actionJoinRoom,
    actionLeaveRoom,
  } = props;
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
        <Col span={24}>
          <Button type="primary" block disabled={!socketConnected} onClick={actionCreateRoom}>
            Create room
          </Button>
        </Col>
      </Row>
      {roomList.length === 0 ? (
        <Text type="secondary">No open rooms</Text>
      ) : (
        <List
          size="small"
          dataSource={roomList}
          renderItem={(room: IGameRoom) => {
            const inThisRoom = room.players.red === playerId || room.players.blue === playerId;
            const canConnect = socketConnected;
            return (
              <List.Item
                style={inThisRoom ? { backgroundColor: '#fffbe6' } : undefined}
                actions={
                  inThisRoom
                    ? [
                        <Button
                          key="disconnect-room"
                          type="link"
                          danger
                          size="small"
                          onClick={() => actionLeaveRoom(room.id)}
                          aria-label={`Disconnect from room ${room.id}`}
                        >
                          Disconnect room
                        </Button>,
                      ]
                    : canConnect
                      ? [
                          <Button
                            key="connect-room"
                            type="link"
                            size="small"
                            onClick={() => actionJoinRoom(room)}
                            aria-label={`Connect to room ${room.id}`}
                          >
                            Connect
                          </Button>,
                        ]
                      : undefined
                }
              >
                <Tag color="gray">{room.id}</Tag>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default RoomsList;
