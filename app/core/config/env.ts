/**
 * Environment Configuration
 */

export const isDevelopment = __DEV__
export const isProduction = !__DEV__
export const isTest = process.env.JEST_WORKER_ID !== undefined

export const config = {
  apiUrl: isDevelopment ? "http://localhost:3000" : "https://api.production.com",
  enableLogging: isDevelopment,
  enablePerformanceMonitoring: isProduction,
}
