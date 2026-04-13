import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export interface SocketConnectionStatusProps {
  socketConnected: boolean;
  connectionError: string | null;
}

const SocketConnectionStatus: React.FC<SocketConnectionStatusProps> = ({
  socketConnected,
  connectionError,
}) => (
  <Text type={socketConnected ? 'success' : 'secondary'}>
    {connectionError
      ? `Error: ${connectionError}`
      : socketConnected
        ? 'Connected'
        : 'Connecting…'}
  </Text>
);

export default SocketConnectionStatus;
