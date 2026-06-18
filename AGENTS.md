# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.

---

## Commands

```bash
# Frontend (React, port 3000)
npm start

# Backend (Socket.IO server, port 3001)
npm run server           # dev mode via tsx (hot-reload)
npm run server:start     # production (compiled dist)

# Shared package — must rebuild after changes to shared/src/
npm run build:shared

# Full production build
npm run build:all        # builds shared → server → React

# Tests
npm test                 # interactive watch mode
npm test -- --watchAll=false  # single run

# Format
npm run format           # write
npm run format:check     # check only (CI)
```

Node 22+ required.

## Architecture

Two-player turn-based browser game ("Infection"). Three layers:

```text
shared/          — @infection-game/shared (npm workspace)
server/          — Socket.IO game server (Node 22, TypeScript)
src/             — React 19 frontend (Create React App)
```

### shared/

Single source of truth for types and serializable game state.

- [shared/src/types.ts](shared/src/types.ts) — `IGameRoom`, `IGameState`, `PlayerType`, `GamePhase`, `RoomPlayerSide`
- [shared/src/gameState.ts](shared/src/gameState.ts) — `GameState` and `ColonySet` classes; serialization (`toIGameState` / `fromSerializedGameState`) and game rules (`_calculateAvailableCellCodes`)
- [shared/src/clientServerEvents.ts](shared/src/clientServerEvents.ts) — Socket.IO event name constants (`CLIENT_REQUEST_EVENTS`, `SERVER_EVENTS`) and payload interfaces

**Always import from `@infection-game/shared`** in both server and frontend — never cross-import between `server/` and `src/`.

After editing `shared/src/`, run `npm run build:shared` before server or frontend pick up changes.

### server/

Express + Socket.IO server. Rooms in-memory (no database).

- [server/src/index.ts](server/src/index.ts) — Socket.IO setup; routes each client event to a handler
- [server/src/game/services/roomService.ts](server/src/game/services/roomService.ts) — `RoomService` singleton; all room CRUD
- [server/src/game/eventHandlers/](server/src/game/eventHandlers/) — one file per client event (`createRoom`, `joinRoom`, `leaveRoom`)
- [server/src/game/gameLogic.ts](server/src/game/gameLogic.ts) — server-side action application (plain data, no class instances)

`GAME_ACTION` handler and `disconnect` cleanup not yet implemented (stubs in `index.ts`).

### Frontend (src/)

React 19 + Redux Toolkit + Ant Design. Socket.IO client.

**State split:**

- **Redux** (`src/store/`) — authoritative `IGameState` (board, virus cells, colony sets, game phase). `gameSlice.ts` contains all reducers.
- **SocketContext** (`src/contexts/SocketContext.tsx`) — socket connection, room list, joined room, game state from server. Composed from four hooks: `useSocketConnection`, `usePlayerSession`, `useRoomEvents`, `useGameState`.
- **GameContext** (`src/contexts/GameContext.tsx`) — UI-only state (sidebar collapsed).

**Cell addressing:** cells identified by `"row-col"` strings (e.g. `"0-0"`, `"3-7"`). Used everywhere — Redux arrays, colony sets, wire protocol.

**Local vs online modes:** `src/store/gameSlice.ts` drives local single-screen mode via `useVirusGame`. Online path: `SocketContext` → server state updates → `stateGame`. Not yet fully integrated.

**Player identity:** UUID generated and persisted to `localStorage` via `usePlayerSession` (`src/hooks/usePlayerSession.ts`). Sent with every socket event.

### Key data flow (online game)

```text
User clicks cell
  → useVirusGame dispatches addVirusCell / addCellToColony (local Redux)
  → [TODO] also emit GAME_ACTION to server

Server receives GAME_ACTION
  → validates against authoritative state
  → broadcasts STATE_UPDATE to room
  → clients receive → dispatch setGameState (hydrate IGameState into Redux)
```
