import React from 'react';
import { Typography, Card, Row, Col, Badge } from 'antd';
import type { PlayerType } from '../interfaces/Board';

const { Text } = Typography;

export interface GameStatusCardProps {
  currentPlayer: PlayerType;
  movesLeft: number;
  availableCellCodes: string[];
}

const GameStatusCard: React.FC<GameStatusCardProps> = ({
  currentPlayer,
  movesLeft,
  availableCellCodes,
}) => (
  <Card title="Game Status" bordered={false} style={{ marginBottom: '20px' }}>
    <Row>
      <Col span={24}>
        <Text
          strong
          style={{
            color: currentPlayer === 'red' ? 'red' : 'blue',
            fontSize: '16px',
          }}
        >
          Current Turn: {currentPlayer.toUpperCase()} PLAYER
        </Text>
      </Col>
    </Row>
    <Row style={{ marginTop: 16 }}>
      <Col span={24}>
        <Badge
          count={movesLeft}
          color={currentPlayer === 'red' ? 'red' : 'blue'}
          style={{ fontSize: '16px' }}
        >
          <Text style={{ fontSize: '14px' }}>Moves Remaining</Text>
        </Badge>
      </Col>
    </Row>
    <Row style={{ marginTop: 16 }}>
      <Col span={24}>
        <Text style={{ fontSize: '14px' }}>Available Cells: {availableCellCodes.length}</Text>
      </Col>
    </Row>
    {availableCellCodes.length > 0 && (
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Text type="warning" style={{ fontSize: '14px' }}>
            First move must be at your base!
            {currentPlayer === 'red' ? ' (Top right)' : ' (Bottom left)'}
          </Text>
        </Col>
      </Row>
    )}
  </Card>
);

export default GameStatusCard;
