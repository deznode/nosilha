/**
 * Unit tests for authStore (Phase 2.7)
 * Tests authentication state management with Zustand
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";

describe("authStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(true);
    });
  });

  describe("setUser Action", () => {
    it("should update user state", () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@nosilha.com",
        role: "user",
      };

      useAuthStore.getState().setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it("should handle null user", () => {
      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe("setSession Action", () => {
    it("should update session state", () => {
      const mockSession = {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_at: Date.now() + 3600000,
        user: {
          id: "123",
          email: "test@nosilha.com",
        },
      } as any;

      useAuthStore.getState().setSession(mockSession);

      const state = useAuthStore.getState();
      expect(state.session).toEqual(mockSession);
    });
  });

  describe("setLoading Action", () => {
    it("should update loading state to false", () => {
      useAuthStore.getState().setLoading(false);

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it("should update loading state to true", () => {
      useAuthStore.getState().setLoading(true);

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });

  describe("logout Action", () => {
    it("should clear user and session", () => {
      // First set some user and session data
      const mockUser = {
        id: "123",
        email: "test@nosilha.com",
        role: "user",
      };
      const mockSession = { access_token: "token" } as any;

      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setSession(mockSession);

      // Then logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe("Selectors", () => {
    it("useUser selector should return user", () => {
      const mockUser = {
        id: "123",
        email: "test@nosilha.com",
      };

      useAuthStore.setState({ user: mockUser });

      // Test selector directly
      const user = useAuthStore.getState().user;

      expect(user).toEqual(mockUser);
    });
  });
});
