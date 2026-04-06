import React from "react";
import { usePlayerSession } from "../hooks/usePlayerSession";

const PlayerSessionBadge: React.FC = () => {
  const sessionName = usePlayerSession();

  return (
    <div
      className="player-session-badge"
      title="Your session name"
      aria-label={`Session ${sessionName}`}
    >
      {sessionName}
    </div>
  );
};

export default PlayerSessionBadge;
