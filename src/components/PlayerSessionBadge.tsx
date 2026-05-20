import React from "react";
import { usePlayerSession } from "../hooks/usePlayerSession";

const PlayerSessionBadge: React.FC = () => {
  const { name } = usePlayerSession();

  return (
    <div
      className="player-session-badge"
      title="Your session name"
      aria-label={`Session ${name}`}
    >
      {name}
    </div>
  );
};

export default PlayerSessionBadge;
