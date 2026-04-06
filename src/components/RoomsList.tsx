import React from "react";
import { Typography, Card, Row, Col, Button, List, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface RoomsListProps {
  roomCodes: string[];
  socketConnected: boolean;
  connectionError: string | null;
  refreshRooms: () => void;
  createRoom: () => void;
}

const RoomsList: React.FC<RoomsListProps> = ({
  roomCodes,
  socketConnected,
  connectionError,
  refreshRooms,
  createRoom,
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
      style={{ marginBottom: "20px" }}
    >
      <Row style={{ marginBottom: 8 }} gutter={[8, 8]}>
        <Col span={24}>
          <Text type={socketConnected ? "success" : "secondary"}>
            {connectionError
              ? `Error: ${connectionError}`
              : socketConnected
                ? "Connected"
                : "Connecting…"}
          </Text>
        </Col>
        <Col span={24}>
          <Button
            type="primary"
            block
            disabled={!socketConnected}
            onClick={createRoom}
          >
            Create room
          </Button>
        </Col>
      </Row>
      {roomCodes.length === 0 ? (
        <Text type="secondary">No open rooms</Text>
      ) : (
        <List
          size="small"
          dataSource={roomCodes}
          renderItem={(code) => (
            <List.Item>
              <Tag color="blue">{code}</Tag>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RoomsList;
