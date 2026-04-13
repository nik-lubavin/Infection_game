import React from 'react';
import { Typography, Card, Row, Col, Button, List, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { GameRoom } from '../types/gameRoom';

const { Text } = Typography;

export interface RoomsListProps {
  roomList: GameRoom[];
  socketConnected: boolean;
  connectionError: string | null;
  refreshRooms: () => void;
  createRoom: () => void;
  disconnectRoom: (roomCode: string) => void;
  socketId: string | null;
}

const RoomsList: React.FC<RoomsListProps> = ({
  roomList,
  socketConnected,
  connectionError,
  refreshRooms,
  createRoom,
  disconnectRoom,
  socketId,
}) => {
  return (
    <Card
      title="Server rooms"
      bordered={false}
      extra={
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={refreshRooms}
          aria-label="Refresh room list"
        />
      }
      style={{ marginBottom: '20px' }}
    >
      <Row style={{ marginBottom: 8 }} gutter={[8, 8]}>
        <Col span={24}>
          <Text type={socketConnected ? 'success' : 'secondary'}>
            {connectionError
              ? `Error: ${connectionError}`
              : socketConnected
                ? 'Connected'
                : 'Connecting…'}
          </Text>
        </Col>
        <Col span={24}>
          <Button type="primary" block disabled={!socketConnected} onClick={createRoom}>
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
          renderItem={(item) => {
            const inThisRoom =
              socketId != null &&
              (item.players.red === socketId || item.players.blue === socketId);
            return (
              <List.Item
                actions={
                  socketConnected && inThisRoom
                    ? [
                        <Button
                          key="disconnect-room"
                          type="link"
                          danger
                          size="small"
                          onClick={() => disconnectRoom(item.id)}
                          aria-label={`Disconnect from room ${item.id}`}
                        >
                          Disconnect room
                        </Button>,
                      ]
                    : undefined
                }
              >
                <Tag color="gray">{item.id}</Tag>
                <Tag color="red">{item.players.red}</Tag>
                <Tag color="blue">{item.players.blue}</Tag>
                <Tag color="gray">{item.hostName}</Tag>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default RoomsList;
