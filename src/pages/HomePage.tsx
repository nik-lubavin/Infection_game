import React from "react";
import { Layout, Typography, Card, Row, Col, Badge } from "antd";
import BoardComponent from "../components/BoardComponent";
import { GRID_SIZE, CELL_SIZE } from "../constants/board";
import { useVirusGame } from "../hooks/useVirusGame";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const { board, currentPlayer, movesLeft, availableCells, onCellClick } =
    useVirusGame();

  // Calculate exact dimensions based on cell size and grid size
  const gridWidth = CELL_SIZE * GRID_SIZE;
  const gridHeight = CELL_SIZE * GRID_SIZE;
  const containerPadding = 20;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", textAlign: "center" }}>
        <Title level={2}>Virus Infection Game</Title>
      </Header>
      <Layout>
        <Sider width={200} theme="light" style={{ padding: "20px" }}>
          <Card title="Game Status" bordered={false}>
            <Row>
              <Col span={24}>
                <Text
                  strong
                  style={{
                    color: currentPlayer === "red" ? "red" : "blue",
                    fontSize: "16px",
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
                  color={currentPlayer === "red" ? "red" : "blue"}
                  style={{ fontSize: "16px" }}
                >
                  <Text style={{ fontSize: "14px" }}>Moves Remaining</Text>
                </Badge>
              </Col>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text style={{ fontSize: "14px" }}>
                  Available Cells: {availableCells.length}
                </Text>
              </Col>
            </Row>
            {availableCells.length > 0 && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Text type="warning" style={{ fontSize: "14px" }}>
                    First move must be at your base!
                    {currentPlayer === "red"
                      ? " (Top right)"
                      : " (Bottom left)"}
                  </Text>
                </Col>
              </Row>
            )}
          </Card>
        </Sider>
        <Content
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
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
