/**
 * Network Context for providing network state throughout the app
 * 앱 전역에서 네트워크 상태를 제공하는 컨텍스트
 */

import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  networkService,
  type ConnectionType,
  type NetworkState,
} from "@/services/network";

export type NetworkContextType = {
  /** Whether the device is connected to any network */
  isConnected: boolean;
  /** Whether the internet is reachable (null if unknown) */
  isInternetReachable: boolean | null;
  /** The type of network connection (wifi, cellular, none, etc.) */
  connectionType: ConnectionType;
  /** Full network state object */
  networkState: NetworkState | null;
  /** Loading state for initial network check */
  isLoading: boolean;
  /** Error message if network check failed */
  error: string | null;
  /** Manually refresh the network state */
  refresh: () => Promise<void>;
};

export const NetworkContext = createContext<NetworkContextType | null>(null);

export interface NetworkProviderProps {}

/**
 * NetworkProvider: Provides real-time network state to the entire app
 * 앱 전역에서 실시간 네트워크 상태를 제공하는 Provider
 *
 * @example
 * // Wrap your app with NetworkProvider
 * <NetworkProvider>
 *   <App />
 * </NetworkProvider>
 *
 * // Use in components
 * const { isConnected, connectionType } = useNetwork();
 */
export const NetworkProvider: FC<PropsWithChildren<NetworkProviderProps>> = ({
  children,
}) => {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize network state on mount
   * 마운트 시 네트워크 상태 초기화
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const initialState = await networkService.getNetworkState();
        setNetworkState(initialState);

        console.log("[NetworkContext] 초기 네트워크 상태:", {
          isConnected: initialState.isConnected,
          connectionType: initialState.connectionType,
        });
      } catch (err) {
        console.error("[NetworkContext] 초기화 오류:", err);
        setError(
          err instanceof Error ? err.message : "네트워크 상태 확인 실패",
        );
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  /**
   * Subscribe to network state changes
   * 네트워크 상태 변경 구독
   */
  useEffect(() => {
    const unsubscribe = networkService.subscribeToNetworkState((state) => {
      setNetworkState(state);

      console.log("[NetworkContext] 네트워크 상태 변경:", {
        isConnected: state.isConnected,
        connectionType: state.connectionType,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Manually refresh the network state
   * 수동으로 네트워크 상태 새로고침
   */
  const refresh = useCallback(async () => {
    try {
      setError(null);
      const refreshedState = await networkService.refresh();
      setNetworkState(refreshedState);

      console.log("[NetworkContext] 네트워크 상태 새로고침:", {
        isConnected: refreshedState.isConnected,
        connectionType: refreshedState.connectionType,
      });
    } catch (err) {
      console.error("[NetworkContext] 새로고침 오류:", err);
      setError(
        err instanceof Error ? err.message : "네트워크 상태 새로고침 실패",
      );
      throw err;
    }
  }, []);

  const value: NetworkContextType = {
    isConnected: networkState?.isConnected ?? false,
    isInternetReachable: networkState?.isInternetReachable ?? null,
    connectionType: networkState?.connectionType ?? "unknown",
    networkState,
    isLoading,
    error,
    refresh,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

/**
 * Custom hook to access network state
 * 네트워크 상태에 접근하는 커스텀 훅
 *
 * @throws Error if used outside of NetworkProvider
 * @returns NetworkContextType
 *
 * @example
 * const { isConnected, connectionType } = useNetwork();
 *
 * if (!isConnected) {
 *   return <OfflineBanner />;
 * }
 */
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
