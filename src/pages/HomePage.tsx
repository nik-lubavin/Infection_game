import React from "react";
import { Layout, Typography, Card, Row, Col, Badge } from "antd";
import BoardComponent from "../components/BoardComponent";
import { GRID_SIZE, CELL_SIZE } from "../constants/board";
import { useVirusGame } from "../hooks/useVirusGame";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const HomePage: React.FC = () => {
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
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", textAlign: "center" }}>
        <Title level={2}>Virus Infection Game</Title>
      </Header>
      <Layout>
        <Sider width={300} theme="light" style={{ padding: "20px" }}>
          <Card
            title="Game Status"
            bordered={false}
            style={{ marginBottom: "20px" }}
          >
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

          <Card title="Colony Sets (JSON)" bordered={false}>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "4px",
                maxHeight: "400px",
                overflow: "auto",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                RED: {JSON.stringify(redColonySetsData, null, 2)}
              </pre>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                BLUE: {JSON.stringify(blueColonySetsData, null, 2)}
              </pre>
            </div>
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
