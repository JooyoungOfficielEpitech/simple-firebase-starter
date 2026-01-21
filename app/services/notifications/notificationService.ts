import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Platform } from "react-native";
import {
  NotificationPermissionStatus,
  LocalNotificationOptions,
  NotificationPayload,
  NotificationResponse,
  StoredNotification,
} from "./notificationTypes";

/**
 * 푸시 알림 서비스
 */
export class NotificationService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * 서비스 초기화
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 알림 핸들러 설정
      this.setNotificationHandler();

      // 토큰 새로고침 리스너 설정
      this.setupTokenRefreshListener();

      this.isInitialized = true;
    } catch (error) {
      console.error("[NotificationService] 초기화 오류:", error);
    }
  }

  /**
   * 알림 권한 요청
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      // iOS의 경우 원격 알림 권한도 함께 요청
      if (Platform.OS === "ios") {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          return "denied";
        }
      }

      // Expo Notifications 권한 요청
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      return this.mapPermissionStatus(status);
    } catch (error) {
      console.error("[NotificationService] 권한 요청 오류:", error);
      return "denied";
    }
  }

  /**
   * 알림 권한 상태 확인
   */
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return this.mapPermissionStatus(status);
    } catch (error) {
      console.error("[NotificationService] 권한 상태 확인 오류:", error);
      return "undetermined";
    }
  }

  /**
   * 권한 상태 매핑
   */
  private mapPermissionStatus(
    status: Notifications.PermissionStatus,
  ): NotificationPermissionStatus {
    if (status === Notifications.PermissionStatus.GRANTED) return "granted";
    if (status === Notifications.PermissionStatus.DENIED) return "denied";
    return "undetermined";
  }

  /**
   * FCM 토큰 가져오기
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // 사용자 인증 확인
      const user = auth().currentUser;
      if (!user) {
        console.warn(
          "[NotificationService] 사용자가 로그인되어 있지 않습니다.",
        );
        return null;
      }

      // 권한 확인
      const permissionStatus = await this.getPermissionStatus();
      if (permissionStatus !== "granted") {
        console.warn("[NotificationService] 알림 권한이 허용되지 않았습니다.");
        return null;
      }

      // FCM 토큰 가져오기
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error("[NotificationService] FCM 토큰 가져오기 오류:", error);
      return null;
    }
  }

  /**
   * 토큰 새로고침 리스너 설정
   */
  private setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async (token) => {
      try {
        console.log(
          "[NotificationService] FCM 토큰이 새로고침되었습니다:",
          token,
        );
        // 토큰을 Firestore에 저장하는 로직은 UserService를 통해 호출됨
      } catch (error) {
        console.error("[NotificationService] 토큰 새로고침 처리 오류:", error);
      }
    });
  }

  /**
   * 로컬 알림 예약
   */
  async scheduleLocalNotification(
    options: LocalNotificationOptions,
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: options.sound || "default",
          badge: options.badge,
        },
        trigger: options.trigger ? this.buildTrigger(options.trigger) : null, // null = 즉시 전송
      });

      return notificationId;
    } catch (error) {
      console.error("[NotificationService] 로컬 알림 예약 오류:", error);
      throw error;
    }
  }

  /**
   * 알림 트리거 생성
   */
  private buildTrigger(
    trigger: LocalNotificationOptions["trigger"],
  ): Notifications.NotificationTriggerInput | null {
    if (!trigger) return null;

    if (trigger.date) {
      return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger.date,
        repeats: trigger.repeats || false,
      } as Notifications.DateTriggerInput;
    }

    if (trigger.seconds) {
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: trigger.seconds,
        repeats: trigger.repeats || false,
      } as Notifications.TimeIntervalTriggerInput;
    }

    return null;
  }

  /**
   * 특정 알림 취소
   */
  async cancelLocalNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("[NotificationService] 알림 취소 오류:", error);
      throw error;
    }
  }

  /**
   * 모든 로컬 알림 취소
   */
  async cancelAllLocalNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("[NotificationService] 모든 알림 취소 오류:", error);
      throw error;
    }
  }

  /**
   * 포그라운드 알림 핸들러 설정
   */
  private setNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  /**
   * 포그라운드 알림 처리
   */
  setupForegroundNotificationListener(
    callback: (notification: NotificationPayload) => void,
  ): () => void {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        try {
          const payload: NotificationPayload = {
            title: notification.request.content.title || "",
            body: notification.request.content.body || "",
            data: notification.request.content.data,
          };
          callback(payload);
        } catch (error) {
          console.error(
            "[NotificationService] 포그라운드 알림 처리 오류:",
            error,
          );
        }
      },
    );

    return () => subscription.remove();
  }

  /**
   * 백그라운드 알림 핸들러 설정
   */
  setupBackgroundMessageHandler(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      try {
        console.log(
          "[NotificationService] 백그라운드 메시지 수신:",
          remoteMessage,
        );
        // 백그라운드에서 받은 메시지 처리 로직
        // 예: 로컬 알림 표시, 데이터 동기화 등
      } catch (error) {
        console.error(
          "[NotificationService] 백그라운드 메시지 처리 오류:",
          error,
        );
      }
    });
  }

  /**
   * 알림 응답 리스너 설정 (알림 탭 시)
   */
  setupNotificationResponseListener(
    callback: (response: NotificationResponse) => void,
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const notificationResponse: NotificationResponse = {
            notification: {
              title: response.notification.request.content.title || "",
              body: response.notification.request.content.body || "",
              data: response.notification.request.content.data,
            },
            actionIdentifier: response.actionIdentifier,
            userText: response.userText,
          };
          callback(notificationResponse);
        } catch (error) {
          console.error("[NotificationService] 알림 응답 처리 오류:", error);
        }
      },
    );

    return () => subscription.remove();
  }

  /**
   * 배지 카운트 설정
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("[NotificationService] 배지 카운트 설정 오류:", error);
      throw error;
    }
  }

  /**
   * 배지 초기화
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("[NotificationService] 배지 초기화 오류:", error);
      throw error;
    }
  }

  /**
   * 모든 전달된 알림 제거 (알림 센터에서)
   */
  async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("[NotificationService] 알림 제거 오류:", error);
      throw error;
    }
  }

  // ============================================
  // Firestore 알림 히스토리 관련 메서드
  // ============================================

  /**
   * 현재 사용자 ID 가져오기
   */
  private getCurrentUserId(): string | null {
    return auth().currentUser?.uid || null;
  }

  /**
   * 알림 목록 가져오기
   * @param limit - 가져올 알림 수
   * @returns 알림 목록
   */
  async getNotifications(limit: number = 50): Promise<StoredNotification[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn("[NotificationService] 사용자가 로그인되어 있지 않습니다.");
        return [];
      }

      const snapshot = await firestore()
        .collection("notifications")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          body: data.body,
          type: data.type || "other",
          isRead: data.isRead || false,
          data: data.data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as StoredNotification;
      });
    } catch (error) {
      console.error("[NotificationService] 알림 목록 조회 오류:", error);
      return [];
    }
  }

  /**
   * 알림 목록 실시간 구독
   * @param callback - 알림 목록 콜백
   * @param limit - 가져올 알림 수
   * @returns 구독 해제 함수
   */
  subscribeToNotifications(
    callback: (notifications: StoredNotification[]) => void,
    limit: number = 50,
  ): () => void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn("[NotificationService] 사용자가 로그인되어 있지 않습니다.");
      callback([]);
      return () => {};
    }

    return firestore()
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .onSnapshot(
        (snapshot) => {
          const notifications = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              title: data.title,
              body: data.body,
              type: data.type || "other",
              isRead: data.isRead || false,
              data: data.data,
              createdAt: data.createdAt?.toDate() || new Date(),
            } as StoredNotification;
          });
          callback(notifications);
        },
        (error) => {
          console.error("[NotificationService] 알림 구독 오류:", error);
          callback([]);
        },
      );
  }

  /**
   * 알림 읽음 처리
   * @param notificationId - 알림 ID
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await firestore().collection("notifications").doc(notificationId).update({
        isRead: true,
        readAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("[NotificationService] 알림 읽음 처리 오류:", error);
      throw error;
    }
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return;

      const snapshot = await firestore()
        .collection("notifications")
        .where("userId", "==", userId)
        .where("isRead", "==", false)
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("[NotificationService] 모든 알림 읽음 처리 오류:", error);
      throw error;
    }
  }

  /**
   * 알림 삭제
   * @param notificationId - 알림 ID
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await firestore().collection("notifications").doc(notificationId).delete();
    } catch (error) {
      console.error("[NotificationService] 알림 삭제 오류:", error);
      throw error;
    }
  }

  /**
   * 읽지 않은 알림 수 가져오기
   * @returns 읽지 않은 알림 수
   */
  async getUnreadNotificationCount(): Promise<number> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return 0;

      const snapshot = await firestore()
        .collection("notifications")
        .where("userId", "==", userId)
        .where("isRead", "==", false)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      console.error("[NotificationService] 읽지 않은 알림 수 조회 오류:", error);
      return 0;
    }
  }
}

// Singleton 패턴
export const notificationService = new NotificationService();
