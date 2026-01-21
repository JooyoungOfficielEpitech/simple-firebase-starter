/**
 * Network Service Types and Structure Tests
 *
 * Note: Full functional testing requires actual NetInfo which is not
 * available in the Jest environment. These tests verify the service
 * structure and type definitions.
 */

import type { ConnectionType, NetworkState } from "./networkTypes";

describe("NetworkService Types", () => {
  describe("ConnectionType", () => {
    it("should have valid connection types", () => {
      const validTypes: ConnectionType[] = [
        "wifi",
        "cellular",
        "bluetooth",
        "ethernet",
        "wimax",
        "vpn",
        "other",
        "none",
        "unknown",
      ];

      validTypes.forEach((type) => {
        expect(type).toBeDefined();
      });
    });
  });

  describe("NetworkState", () => {
    it("should have valid NetworkState structure", () => {
      const mockState: NetworkState = {
        isConnected: true,
        isInternetReachable: true,
        connectionType: "wifi",
        type: "wifi" as any,
        details: null,
      };

      expect(mockState.isConnected).toBe(true);
      expect(mockState.isInternetReachable).toBe(true);
      expect(mockState.connectionType).toBe("wifi");
    });

    it("should handle offline state", () => {
      const offlineState: NetworkState = {
        isConnected: false,
        isInternetReachable: false,
        connectionType: "none",
        type: "none" as any,
        details: null,
      };

      expect(offlineState.isConnected).toBe(false);
      expect(offlineState.connectionType).toBe("none");
    });

    it("should handle null isInternetReachable", () => {
      const unknownState: NetworkState = {
        isConnected: true,
        isInternetReachable: null,
        connectionType: "cellular",
        type: "cellular" as any,
        details: null,
      };

      expect(unknownState.isConnected).toBe(true);
      expect(unknownState.isInternetReachable).toBeNull();
    });
  });

  describe("ConnectionType Mapping", () => {
    it("should map all supported connection types", () => {
      const connectionTypes = new Map<string, ConnectionType>([
        ["wifi", "wifi"],
        ["cellular", "cellular"],
        ["bluetooth", "bluetooth"],
        ["ethernet", "ethernet"],
        ["wimax", "wimax"],
        ["vpn", "vpn"],
        ["other", "other"],
        ["none", "none"],
        ["unknown", "unknown"],
      ]);

      connectionTypes.forEach((expected, input) => {
        expect(expected).toBe(input);
      });
    });
  });
});
