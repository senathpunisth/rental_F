// src/stores/useAuthStore.js
import { create } from "zustand";

/**
 * Replace this mock with your real auth (JWT/cookies).
 * Keep the shape: { user, role, isAuthenticated, signIn, signOut }
 */
export const useAuthStore = create((set) => ({
  user: null,                 // { id, name, email } or null
  role: "user",               // "user" | "host" | "admin"
  isAuthenticated: false,

  // Call this after your real login succeeds
  signIn: (user, role = "user") =>
    set({ user, role, isAuthenticated: true }),

  signOut: () =>
    set({ user: null, role: "user", isAuthenticated: false }),
}));
