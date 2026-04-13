import React from 'react';
import { Typography, Card, Row, Col, Button, List, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import type { IGameRoom } from '@infection-game/shared';
import SocketConnectionStatus from './SocketConnectionStatus';
const { Text } = Typography;

export interface RoomsListProps {
  socketId: string | null;
  connectionError: string | null;
  stateRoomList: IGameRoom[];
  socketConnected: boolean;
  actionListRooms: () => void;
  actionCreateRoom: () => void;
  actionLeaveRoom: (roomCode: string) => void;
}

const RoomsList: React.FC<RoomsListProps> = (props) => {
  const {
    socketId,
    connectionError,
    stateRoomList,
    socketConnected,
    actionListRooms,
    actionCreateRoom,
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
      {stateRoomList.length === 0 ? (
        <Text type="secondary">No open rooms</Text>
      ) : (
        <List
          size="small"
          dataSource={stateRoomList}
          renderItem={(item) => {
            const inThisRoom =
              socketId != null && (item.players.red === socketId || item.players.blue === socketId);
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
                          onClick={() => actionLeaveRoom(item.id)}
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
