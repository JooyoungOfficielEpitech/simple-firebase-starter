/**
 * Network service type definitions
 * 네트워크 상태 관련 타입 정의
 */

import type {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";

/**
 * Supported connection types
 * 지원하는 연결 타입
 */
export type ConnectionType =
  | "wifi"
  | "cellular"
  | "bluetooth"
  | "ethernet"
  | "wimax"
  | "vpn"
  | "other"
  | "unknown"
  | "none";

/**
 * Network state with simplified properties
 * 간소화된 네트워크 상태
 */
export interface NetworkState {
  /** Whether the device is connected to any network */
  isConnected: boolean;
  /** Whether the internet is reachable (null if unknown) */
  isInternetReachable: boolean | null;
  /** The type of network connection */
  connectionType: ConnectionType;
  /** Raw NetInfo state type */
  type: NetInfoStateType;
  /** Additional details about the connection (if available) */
  details: NetInfoState["details"];
}

/**
 * Network state change callback type
 * 네트워크 상태 변경 콜백 타입
 */
export type NetworkStateCallback = (state: NetworkState) => void;

/**
 * Network service error types
 * 네트워크 서비스 에러 타입
 */
export type NetworkErrorType =
  | "FETCH_ERROR"
  | "SUBSCRIPTION_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Network service error
 * 네트워크 서비스 에러
 */
export interface NetworkError {
  type: NetworkErrorType;
  message: string;
  originalError?: Error;
}
