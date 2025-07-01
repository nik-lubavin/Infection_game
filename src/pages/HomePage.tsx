import React, { useState } from "react";
import { Layout, Typography, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import BoardComponent from "../components/BoardComponent";
import Sidebar from "../components/Sidebar";
import { GRID_SIZE, CELL_SIZE } from "../constants/board";
import { useVirusGame } from "../hooks/useVirusGame";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const HomePage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    board,
    currentPlayer,
    movesLeft,
    availableCells,
    blueColonySets,
    redColonySets,
    onCellClick,
  } = useVirusGame();

  // Calculate exact dimensions based on cell size and grid size
  const gridWidth = CELL_SIZE * GRID_SIZE;
  const gridHeight = CELL_SIZE * GRID_SIZE;
  const containerPadding = 20;

  // Prepare colonySets data for JSON display
  const redColonySetsData = redColonySets.map((colonySet, index) => ({
    id: index,
    playerType: colonySet.playerType,
    activated: colonySet.activated,
    cells: colonySet.getColonyCells().map((cell) => ({
      rowIdx: cell.rowIdx,
      colIdx: cell.colIdx,
      content: cell.content,
    })),
  }));

  const blueColonySetsData = blueColonySets.map((colonySet, index) => ({
    id: index,
    playerType: colonySet.playerType,
    activated: colonySet.activated,
    cells: colonySet.getColonyCells().map((cell) => ({
      rowIdx: cell.rowIdx,
      colIdx: cell.colIdx,
      content: cell.content,
    })),
  }));

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
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
      <Layout
        style={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 64px)",
        }}
      >
        <Sidebar
          currentPlayer={currentPlayer}
          movesLeft={movesLeft}
          availableCells={availableCells}
          redColonySets={redColonySetsData}
          blueColonySets={blueColonySetsData}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
        <Content
          style={{
            padding: "20px",
            display: "flex",
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
              availableCells={availableCells}
            />
          </div>
        </Content>
      </Layout>
      <Footer style={{ textAlign: "center" }}>
        Virus Infection Game ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default HomePage;
