import React from "react";
import { Layout, Typography, Button, Modal } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import BoardComponent from "../components/BoardComponent";
import Sidebar from "../components/Sidebar";
import { GRID_SIZE, CELL_SIZE } from "../constants/board";
import { useVirusGame } from "../hooks/useVirusGame";
import { useGameContext } from "../contexts/GameContext";
import { useAppSelector } from "../store/hooks";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const HomePage: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useGameContext();

  const { board, currentPlayer, movesLeft, onCellClick } = useVirusGame();
  const { availableCellCodes, loser } = useAppSelector((state) => state.game);

  // Calculate exact dimensions based on cell size and grid size
  const gridWidth = CELL_SIZE * GRID_SIZE;
  const gridHeight = CELL_SIZE * GRID_SIZE;
  const containerPadding = 20;

  return (
    <Layout
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        style={{
          background: "#fff",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="text"
          icon={
            sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
          }
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ fontSize: "16px", width: 64, height: 64 }}
        />
        <Title level={2} style={{ margin: 0 }}>
          Virus Infection Game
        </Title>
        <div style={{ width: 64 }}></div>
      </Header>
      <Layout style={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
        <Sidebar
          currentPlayer={currentPlayer}
          movesLeft={movesLeft}
          availableCellCodes={availableCellCodes}
          collapsed={sidebarCollapsed}
        />
        <Content
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: containerPadding,
              width: `${gridWidth + 2 * containerPadding}px`,
              height: `${gridHeight + 2 * containerPadding}px`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              borderRadius: "4px",
            }}
          >
            <BoardComponent
              size={GRID_SIZE}
              currentTurn={currentPlayer}
              onCellClick={onCellClick}
              board={board}
            />
          </div>
        </Content>
      </Layout>
      <Footer style={{ textAlign: "center" }}>
        Virus Infection Game ©{new Date().getFullYear()}
      </Footer>
      <Modal
        open={loser !== null}
        title="Game Over"
        footer={null}
        closable={false}
        maskClosable={false}
      >
        <Typography.Text style={{ fontSize: "18px" }}>
          Player {loser?.toUpperCase()} lost
        </Typography.Text>
      </Modal>
    </Layout>
  );
};

export default HomePage;
