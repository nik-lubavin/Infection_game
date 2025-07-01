import React, { useState, useRef } from "react";
import { Typography, Card, Row, Col, Badge } from "antd";
import { PlayerType } from "../interfaces/Board";
import { ICell } from "../classes/Cell";

const { Text } = Typography;

interface SidebarProps {
  currentPlayer: PlayerType;
  movesLeft: number;
  availableCells: ICell[];
  redColonySets: any[];
  blueColonySets: any[];
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPlayer,
  movesLeft,
  availableCells,
  redColonySets,
  blueColonySets,
  collapsed,
  onCollapse,
}) => {
  const [width, setWidth] = useState(300);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current && sidebarRef.current) {
      const newWidth =
        e.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > 80 && newWidth < 600) {
        // Set min and max width
        setWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      style={{
        width: collapsed ? 80 : width,
        height: "100vh",
        backgroundColor: "#fff",
        borderRight: "1px solid #f0f0f0",
        padding: collapsed ? "20px 10px" : "20px",
        transition: "width 0.2s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "5px",
          cursor: "col-resize",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
        onMouseDown={handleMouseDown}
      />
      {!collapsed && (
        <>
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
                RED: {JSON.stringify(redColonySets, null, 2)}
              </pre>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                BLUE: {JSON.stringify(blueColonySets, null, 2)}
              </pre>
            </div>
          </Card>
        </>
      )}

      {collapsed && (
        <div style={{ textAlign: "center", color: "#666" }}>
          <div style={{ fontSize: "12px", marginBottom: "8px" }}>
            {currentPlayer === "red" ? "🔴" : "🔵"}
          </div>
          <div style={{ fontSize: "10px" }}>{movesLeft}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
