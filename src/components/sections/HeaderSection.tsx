import React from 'react';
import { Layout, Typography, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

export interface HeaderSectionProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ sidebarCollapsed, onToggleSidebar }) => (
  <Header
    style={{
      background: '#fff',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Button
      type="text"
      icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={onToggleSidebar}
      style={{ fontSize: '16px', width: 64, height: 64 }}
    />
    <Title level={2} style={{ margin: 0 }}>
      Virus Infection Game
    </Title>
  </Header>
);

export default HeaderSection;
