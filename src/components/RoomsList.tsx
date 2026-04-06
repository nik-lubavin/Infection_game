import React from "react";
import { Typography, Card, Row, Col, Button, List, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useRoomsList } from "../hooks/useRoomsList";

const { Text } = Typography;

const RoomsList: React.FC = () => {
  const { roomCodes, socketConnected, refreshRooms, createRoom } =
    useRoomsList();

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
            {socketConnected ? "Connected" : "Connecting…"}
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
