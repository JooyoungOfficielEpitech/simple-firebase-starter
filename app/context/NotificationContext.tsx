import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

import { notificationService } from "@/services/notifications";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/firestore";
import {
  NotificationPermissionStatus,
  LocalNotificationOptions,
} from "@/services/notifications/notificationTypes";

export type NotificationContextType = {
  // 알림 권한 상태
  permissionStatus: NotificationPermissionStatus;
  isPermissionLoading: boolean;

  // FCM 토큰
  fcmToken: string | null;

  // 알림 권한 요청 함수
  requestPermissions: () => Promise<NotificationPermissionStatus>;

  // 로컬 알림 함수
  scheduleLocalNotification: (
    options: LocalNotificationOptions,
  ) => Promise<string>;
  cancelLocalNotification: (id: string) => Promise<void>;
  cancelAllLocalNotifications: () => Promise<void>;

  // 배지 관리
  setBadgeCount: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;

  // 에러 상태
  notificationError: string | null;
  clearNotificationError: () => void;
};

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export interface NotificationProviderProps {}

export const NotificationProvider: FC<
  PropsWithChildren<NotificationProviderProps>
> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>("undetermined");
  const [isPermissionLoading, setIsPermissionLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );

  /**
   * FCM 토큰을 Firestore에 저장
   */
  const saveTokenToFirestore = useCallback(
    async (token: string) => {
      if (!isAuthenticated) {
        console.log(
          "[NotificationContext] 로그인하지 않아 FCM 토큰을 저장하지 않습니다.",
        );
        return;
      }

      try {
        const platform = Platform.OS === "ios" ? "ios" : "android";
        await userService.saveFCMToken(token, platform);
        console.log(
          "[NotificationContext] FCM 토큰이 Firestore에 저장되었습니다.",
        );
      } catch (error) {
        console.error("[NotificationContext] FCM 토큰 저장 오류:", error);
        setNotificationError(
          error instanceof Error ? error.message : "FCM 토큰 저장 실패",
        );
      }
    },
    [isAuthenticated],
  );

  /**
   * 초기화: 권한 상태 확인 및 FCM 토큰 가져오기
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsPermissionLoading(true);

        // 1. 알림 권한 상태 확인
        const status = await notificationService.getPermissionStatus();
        setPermissionStatus(status);

        // 2. FCM 토큰 가져오기 (권한이 허용된 경우에만)
        if (status === "granted") {
          const token = await notificationService.getFCMToken();
          setFcmToken(token);

          // 3. 토큰을 Firestore에 저장 (로그인 상태일 때만)
          if (token) {
            await saveTokenToFirestore(token);
          }
        }
      } catch (error) {
        console.error("[NotificationContext] 초기화 오류:", error);
        setNotificationError(
          error instanceof Error ? error.message : "알림 초기화 실패",
        );
      } finally {
        setIsPermissionLoading(false);
      }
    };

    initialize();
  }, [saveTokenToFirestore]);

  /**
   * 알림 리스너 설정
   */
  useEffect(() => {
    // 포그라운드 알림 리스너
    const foregroundUnsubscribe =
      notificationService.setupForegroundNotificationListener(
        (notification) => {
          console.log(
            "[NotificationContext] 포그라운드 알림 수신:",
            notification,
          );
          // 필요한 경우 여기서 추가 처리 (예: 상태 업데이트, UI 알림 표시 등)
        },
      );

    // 알림 응답 리스너 (사용자가 알림을 탭했을 때)
    const responseUnsubscribe =
      notificationService.setupNotificationResponseListener((response) => {
        console.log("[NotificationContext] 알림 탭됨:", response);
        // 딥링킹 처리 등
        // 예: navigation.navigate(...)
      });

    // FCM 토큰 새로고침 리스너
    const tokenRefreshUnsubscribe = messaging().onTokenRefresh(
      async (newToken) => {
        console.log("[NotificationContext] FCM 토큰 새로고침됨:", newToken);
        setFcmToken(newToken);

        // 새 토큰을 Firestore에 저장
        await saveTokenToFirestore(newToken);
      },
    );

    // Cleanup
    return () => {
      foregroundUnsubscribe();
      responseUnsubscribe();
      tokenRefreshUnsubscribe();
    };
  }, [saveTokenToFirestore]);

  /**
   * 알림 권한 요청
   */
  const requestPermissions = useCallback(async () => {
    try {
      setIsPermissionLoading(true);
      setNotificationError(null);

      const status = await notificationService.requestPermissions();
      setPermissionStatus(status);

      // 권한이 허용되면 FCM 토큰 가져오기
      if (status === "granted") {
        const token = await notificationService.getFCMToken();
        setFcmToken(token);

        // 토큰을 Firestore에 저장
        if (token) {
          await saveTokenToFirestore(token);
        }
      }

      return status;
    } catch (error) {
      console.error("[NotificationContext] 권한 요청 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "알림 권한 요청 실패";
      setNotificationError(errorMessage);
      throw error;
    } finally {
      setIsPermissionLoading(false);
    }
  }, [saveTokenToFirestore]);

  /**
   * 로컬 알림 예약
   */
  const scheduleLocalNotification = useCallback(
    async (options: LocalNotificationOptions) => {
      try {
        setNotificationError(null);
        return await notificationService.scheduleLocalNotification(options);
      } catch (error) {
        console.error("[NotificationContext] 로컬 알림 예약 오류:", error);
        const errorMessage =
          error instanceof Error ? error.message : "로컬 알림 예약 실패";
        setNotificationError(errorMessage);
        throw error;
      }
    },
    [],
  );

  /**
   * 특정 로컬 알림 취소
   */
  const cancelLocalNotification = useCallback(async (id: string) => {
    try {
      setNotificationError(null);
      await notificationService.cancelLocalNotification(id);
    } catch (error) {
      console.error("[NotificationContext] 로컬 알림 취소 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "로컬 알림 취소 실패";
      setNotificationError(errorMessage);
      throw error;
    }
  }, []);

  /**
   * 모든 로컬 알림 취소
   */
  const cancelAllLocalNotifications = useCallback(async () => {
    try {
      setNotificationError(null);
      await notificationService.cancelAllLocalNotifications();
    } catch (error) {
      console.error("[NotificationContext] 모든 로컬 알림 취소 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "모든 로컬 알림 취소 실패";
      setNotificationError(errorMessage);
      throw error;
    }
  }, []);

  /**
   * 배지 카운트 설정
   */
  const setBadgeCount = useCallback(async (count: number) => {
    try {
      setNotificationError(null);
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error("[NotificationContext] 배지 카운트 설정 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "배지 카운트 설정 실패";
      setNotificationError(errorMessage);
      throw error;
    }
  }, []);

  /**
   * 배지 초기화
   */
  const clearBadge = useCallback(async () => {
    try {
      setNotificationError(null);
      await notificationService.clearBadge();
    } catch (error) {
      console.error("[NotificationContext] 배지 초기화 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "배지 초기화 실패";
      setNotificationError(errorMessage);
      throw error;
    }
  }, []);

  /**
   * 에러 초기화
   */
  const clearNotificationError = useCallback(() => {
    setNotificationError(null);
  }, []);

  const value: NotificationContextType = {
    permissionStatus,
    isPermissionLoading,
    fcmToken,
    requestPermissions,
    scheduleLocalNotification,
    cancelLocalNotification,
    cancelAllLocalNotifications,
    setBadgeCount,
    clearBadge,
    notificationError,
    clearNotificationError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
