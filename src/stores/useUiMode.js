// src/stores/useUiMode.js
import { create } from "zustand";

export const useUiMode = create((set) => ({
  mode: "user", // "user" | "host"
  carAdded: false, // track if at least one car was saved

  enterHost: () => set({ mode: "host" }),
  exitHost: () => set({ mode: "user", carAdded: false }),

  markCarAdded: () => set({ carAdded: true }),
}));
