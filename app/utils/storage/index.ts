import { MMKV } from "react-native-mmkv"

// Validate encryption key exists and meets minimum security requirements
const getEncryptionKey = (): string => {
  const key = __DEV__
    ? process.env.EXPO_PUBLIC_ENCRYPTION_KEY_DEV
    : process.env.EXPO_PUBLIC_ENCRYPTION_KEY_PROD

  if (!key) {
    throw new Error(
      `Missing encryption key for ${__DEV__ ? 'development' : 'production'} environment. ` +
      `Please set EXPO_PUBLIC_ENCRYPTION_KEY_${__DEV__ ? 'DEV' : 'PROD'} in your environment variables.`
    )
  }

  if (key.length < 16) {
    throw new Error(
      'Encryption key must be at least 16 characters long for security reasons.'
    )
  }

  return key
}

export const storage = new MMKV({
  id: "mmecoco-encrypted-storage",
  encryptionKey: getEncryptionKey(),
})

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export function loadString(key: string): string | null {
  try {
    return storage.getString(key) ?? null
  } catch (error) {
    console.warn(`Failed to load string from storage for key "${key}":`, error)
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function saveString(key: string, value: string): boolean {
  try {
    storage.set(key, value)
    return true
  } catch (error) {
    console.warn(`Failed to save string to storage for key "${key}":`, error)
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export function load<T>(key: string): T | null {
  try {
    const rawData = loadString(key)
    if (rawData === null) {
      return null
    }
    return JSON.parse(rawData) as T
  } catch (error) {
    // Log the parsing error for debugging while returning null for failed parsing
    console.warn(`Failed to parse stored data for key "${key}":`, error)
    return null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Failed to serialize and save data for key "${key}":`, error)
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export function remove(key: string): void {
  try {
    storage.delete(key)
  } catch (error) {
    console.warn(`Failed to remove data from storage for key "${key}":`, error)
  }
}

/**
 * Burn it all to the ground.
 */
export function clear(): void {
  try {
    storage.clearAll()
  } catch (error) {
    console.warn('Failed to clear all storage data:', error)
  }
}
