/**
 * Network service for monitoring network connectivity status
 * 네트워크 연결 상태를 모니터링하는 서비스
 */

import NetInfo, {
  type NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";

import type {
  ConnectionType,
  NetworkState,
  NetworkStateCallback,
} from "./networkTypes";

/**
 * Maps NetInfo state type to simplified connection type
 * NetInfo 상태 타입을 간소화된 연결 타입으로 매핑
 */
function mapConnectionType(type: NetInfoStateType): ConnectionType {
  switch (type) {
    case NetInfoStateType.wifi:
      return "wifi";
    case NetInfoStateType.cellular:
      return "cellular";
    case NetInfoStateType.bluetooth:
      return "bluetooth";
    case NetInfoStateType.ethernet:
      return "ethernet";
    case NetInfoStateType.wimax:
      return "wimax";
    case NetInfoStateType.vpn:
      return "vpn";
    case NetInfoStateType.other:
      return "other";
    case NetInfoStateType.none:
      return "none";
    default:
      return "unknown";
  }
}

/**
 * Transforms NetInfo state to simplified NetworkState
 * NetInfo 상태를 간소화된 NetworkState로 변환
 */
function transformNetInfoState(state: NetInfoState): NetworkState {
  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    connectionType: mapConnectionType(state.type),
    type: state.type,
    details: state.details,
  };
}

/**
 * Network service class for managing network state
 * 네트워크 상태를 관리하는 서비스 클래스
 */
export class NetworkService {
  /**
   * Get the current network state
   * 현재 네트워크 상태 가져오기
   *
   * @returns Promise<NetworkState> The current network state
   * @example
   * const state = await networkService.getNetworkState();
   * console.log(state.isConnected); // true or false
   */
  async getNetworkState(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      return transformNetInfoState(state);
    } catch (error) {
      console.error("[NetworkService] Failed to get network state:", error);
      // Return a default offline state on error
      return {
        isConnected: false,
        isInternetReachable: false,
        connectionType: "unknown",
        type: NetInfoStateType.unknown,
        details: null,
      };
    }
  }

  /**
   * Subscribe to network state changes
   * 네트워크 상태 변경 리스너 등록
   *
   * @param callback Function to be called when network state changes
   * @returns Unsubscribe function
   * @example
   * const unsubscribe = networkService.subscribeToNetworkState((state) => {
   *   console.log('Network connected:', state.isConnected);
   * });
   * // Later, to unsubscribe:
   * unsubscribe();
   */
  subscribeToNetworkState(callback: NetworkStateCallback): () => void {
    const unsubscribe = NetInfo.addEventListener((state) => {
      callback(transformNetInfoState(state));
    });

    return unsubscribe;
  }

  /**
   * Check if the device is connected to the internet
   * 인터넷 연결 확인
   *
   * @returns Promise<boolean> True if connected, false otherwise
   * @example
   * const isOnline = await networkService.isConnected();
   * if (!isOnline) {
   *   showOfflineMessage();
   * }
   */
  async isConnected(): Promise<boolean> {
    try {
      const state = await this.getNetworkState();
      return state.isConnected && state.isInternetReachable !== false;
    } catch (error) {
      console.error("[NetworkService] Failed to check connection:", error);
      return false;
    }
  }

  /**
   * Get the current connection type
   * 연결 타입 확인 (wifi, cellular, etc.)
   *
   * @returns Promise<ConnectionType> The current connection type
   * @example
   * const type = await networkService.getConnectionType();
   * if (type === 'cellular') {
   *   showDataUsageWarning();
   * }
   */
  async getConnectionType(): Promise<ConnectionType> {
    try {
      const state = await this.getNetworkState();
      return state.connectionType;
    } catch (error) {
      console.error("[NetworkService] Failed to get connection type:", error);
      return "unknown";
    }
  }

  /**
   * Refresh network state configuration
   * 네트워크 상태 설정 새로고침
   *
   * This is useful when you want to force a refresh of the network state
   * after certain events like app coming to foreground.
   *
   * @returns Promise<NetworkState> The refreshed network state
   */
  async refresh(): Promise<NetworkState> {
    try {
      const state = await NetInfo.refresh();
      return transformNetInfoState(state);
    } catch (error) {
      console.error("[NetworkService] Failed to refresh network state:", error);
      return this.getNetworkState();
    }
  }
}

/**
 * Singleton instance of NetworkService
 * NetworkService 싱글톤 인스턴스
 */
export const networkService = new NetworkService();
