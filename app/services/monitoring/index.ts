/**
 * Monitoring Services
 */

export { QueryPerformanceMonitor, queryMonitor } from "./QueryPerformanceMonitor"
export { BusinessMetricsCollector, businessMetrics } from "./BusinessMetricsCollector"
export { PerformanceDashboard, dashboard } from "./PerformanceDashboard"
export { NotificationMonitor, notificationMonitor } from "./NotificationMonitor"

// ⚠️ Firebase Performance requires @react-native-firebase/perf package
// Uncomment after installing: npm install @react-native-firebase/perf
// export { FirebasePerformance, firebasePerformance, withTrace } from "./FirebasePerformance"
