import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types and paths in state
        ignoredActions: [],
        ignoredActionPaths: [],
        ignoredPaths: ["game.board", "game.redVirusCellCodes", "game.blueVirusCellCodes", "game.redColonySets", "game.blueColonySets"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

