import React from "react";
import { PlayerType } from "../interfaces/Board";

interface MonsterProps {
  type: PlayerType;
  active?: boolean;
}

const Monster: React.FC<MonsterProps> = ({ type, active = false }) => {
  const color = type === "red" ? "#ff0000" : "#0000ff";
  const eyeColor = "#ffffff";
  const pupilColor = "#000000";

  return (
    <div
      style={{
        position: "relative",
        width: "100px",
        height: "100px",
        opacity: active ? 1 : 0.6,
        transition: "all 0.3s ease",
      }}
    >
      {/* Monster body */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: color,
          position: "relative",
          boxShadow: active ? `0 0 20px ${color}` : "none",
        }}
      >
        {/* Eyes */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "20%",
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            backgroundColor: eyeColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Pupil */}
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: pupilColor,
            }}
          ></div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "20%",
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            backgroundColor: eyeColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Pupil */}
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: pupilColor,
            }}
          ></div>
        </div>

        {/* Mouth */}
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "25%",
            width: "50%",
            height: "20px",
            borderRadius: "0 0 20px 20px",
            backgroundColor: type === "red" ? "#990000" : "#000099",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Monster;
