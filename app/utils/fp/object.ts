/**
 * Functional object utilities
 *
 * Pure functions for object manipulation
 */

import type { Mapper } from './types'

/**
 * Pick specified keys from object
 *
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }

  return result
}

/**
 * Omit specified keys from object
 *
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const keysSet = new Set(keys)
  const result = {} as Omit<T, K>

  for (const key in obj) {
    if (!keysSet.has(key as any)) {
      result[key as keyof Omit<T, K>] = obj[key] as any
    }
  }

  return result
}

/**
 * Map over object keys
 *
 * @example
 * mapKeys({ a: 1, b: 2 }, k => k.toUpperCase()) // { A: 1, B: 2 }
 */
export function mapKeys<T extends object>(
  obj: T,
  fn: Mapper<string, string>
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {}

  for (const key in obj) {
    result[fn(key)] = obj[key]
  }

  return result
}

/**
 * Map over object values
 *
 * @example
 * mapValues({ a: 1, b: 2 }, v => v * 2) // { a: 2, b: 4 }
 */
export function mapValues<T extends object, R>(
  obj: T,
  fn: Mapper<T[keyof T], R>
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>

  for (const key in obj) {
    result[key] = fn(obj[key])
  }

  return result
}

/**
 * Map over object entries (both keys and values)
 *
 * @example
 * mapEntries(
 *   { a: 1, b: 2 },
 *   ([k, v]) => [k.toUpperCase(), v * 2]
 * ) // { A: 2, B: 4 }
 */
export function mapEntries<T extends object, R>(
  obj: T,
  fn: (entry: [string, T[keyof T]]) => [string, R]
): Record<string, R> {
  const result: Record<string, R> = {}

  for (const key in obj) {
    const [newKey, newValue] = fn([key, obj[key]])
    result[newKey] = newValue
  }

  return result
}

/**
 * Filter object by predicate on values
 *
 * @example
 * filterValues({ a: 1, b: 2, c: 3 }, v => v > 1) // { b: 2, c: 3 }
 */
export function filterValues<T extends object>(
  obj: T,
  predicate: (value: T[keyof T]) => boolean
): Partial<T> {
  const result = {} as Partial<T>

  for (const key in obj) {
    if (predicate(obj[key])) {
      result[key] = obj[key]
    }
  }

  return result
}

/**
 * Filter object by predicate on keys
 *
 * @example
 * filterKeys({ a: 1, b: 2, c: 3 }, k => k !== 'b') // { a: 1, c: 3 }
 */
export function filterKeys<T extends object>(
  obj: T,
  predicate: (key: string) => boolean
): Partial<T> {
  const result = {} as Partial<T>

  for (const key in obj) {
    if (predicate(key)) {
      result[key] = obj[key]
    }
  }

  return result
}

/**
 * Filter object by predicate on entries
 *
 * @example
 * filterEntries(
 *   { a: 1, b: 2, c: 3 },
 *   ([k, v]) => k !== 'b' && v > 1
 * ) // { c: 3 }
 */
export function filterEntries<T extends object>(
  obj: T,
  predicate: (entry: [string, T[keyof T]]) => boolean
): Partial<T> {
  const result = {} as Partial<T>

  for (const key in obj) {
    if (predicate([key, obj[key]])) {
      result[key] = obj[key]
    }
  }

  return result
}

/**
 * Merge multiple objects (shallow)
 *
 * @example
 * merge({ a: 1 }, { b: 2 }, { c: 3 }) // { a: 1, b: 2, c: 3 }
 */
export function merge<T extends object>(...objects: T[]): T {
  return Object.assign({}, ...objects)
}

/**
 * Deep merge multiple objects
 *
 * @example
 * mergeDeep(
 *   { a: { b: 1 } },
 *   { a: { c: 2 } }
 * ) // { a: { b: 1, c: 2 } }
 */
export function mergeDeep<T extends object>(...objects: T[]): T {
  const isObject = (obj: any): obj is object =>
    obj && typeof obj === 'object' && !Array.isArray(obj)

  return objects.reduce((result, obj) => {
    Object.keys(obj).forEach((key) => {
      const resultValue = (result as any)[key]
      const objValue = (obj as any)[key]

      if (isObject(resultValue) && isObject(objValue)) {
        ;(result as any)[key] = mergeDeep(resultValue, objValue)
      } else {
        ;(result as any)[key] = objValue
      }
    })

    return result
  }, {} as T)
}

/**
 * Clone object (shallow)
 *
 * @example
 * const original = { a: 1, b: 2 }
 * const cloned = clone(original)
 * cloned.a = 99
 * console.log(original.a) // 1
 */
export function clone<T extends object>(obj: T): T {
  return { ...obj }
}

/**
 * Deep clone object
 *
 * @example
 * const original = { a: { b: 1 } }
 * const cloned = cloneDeep(original)
 * cloned.a.b = 99
 * console.log(original.a.b) // 1
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    return obj.map((item) => cloneDeep(item)) as any
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = cloneDeep(obj[key])
      }
    }

    return clonedObj
  }

  return obj
}

/**
 * Get nested value safely
 *
 * @example
 * const obj = { a: { b: { c: 1 } } }
 * get(obj, 'a.b.c') // 1
 * get(obj, 'a.x.y') // undefined
 * get(obj, 'a.x.y', 'default') // 'default'
 */
export function get<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result == null) {
      return defaultValue
    }
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * Set nested value safely
 *
 * @example
 * const obj = {}
 * set(obj, 'a.b.c', 1) // { a: { b: { c: 1 } } }
 */
export function set<T extends object>(obj: T, path: string, value: any): T {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current: any = obj

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
  return obj
}

/**
 * Check if object has nested path
 *
 * @example
 * const obj = { a: { b: { c: 1 } } }
 * has(obj, 'a.b.c') // true
 * has(obj, 'a.x.y') // false
 */
export function has(obj: any, path: string): boolean {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current == null || !(key in current)) {
      return false
    }
    current = current[key]
  }

  return true
}

/**
 * Get object keys as typed array
 *
 * @example
 * keys({ a: 1, b: 2 }) // ['a', 'b']
 */
export function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * Get object values
 *
 * @example
 * values({ a: 1, b: 2 }) // [1, 2]
 */
export function values<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj)
}

/**
 * Get object entries
 *
 * @example
 * entries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * Create object from entries
 *
 * @example
 * fromEntries([['a', 1], ['b', 2]]) // { a: 1, b: 2 }
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: [K, V][]
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}

/**
 * Invert object keys and values
 *
 * @example
 * invert({ a: 'x', b: 'y' }) // { x: 'a', y: 'b' }
 */
export function invert<T extends Record<string, string | number>>(
  obj: T
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const key in obj) {
    result[String(obj[key])] = key
  }

  return result
}

/**
 * Check if object is empty
 *
 * @example
 * isEmpty({}) // true
 * isEmpty({ a: 1 }) // false
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Check if two objects are equal (shallow)
 *
 * @example
 * isEqual({ a: 1 }, { a: 1 }) // true
 * isEqual({ a: 1 }, { a: 2 }) // false
 */
export function isEqual<T extends object>(obj1: T, obj2: T): boolean {
  const keys1 = keys(obj1)
  const keys2 = keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

/**
 * Deep equality check
 *
 * @example
 * isDeepEqual({ a: { b: 1 } }, { a: { b: 1 } }) // true
 */
export function isDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true
  }

  if (obj1 == null || obj2 == null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

/**
 * Freeze object recursively (immutability)
 *
 * @example
 * const obj = deepFreeze({ a: { b: 1 } })
 * obj.a.b = 2 // TypeError in strict mode
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj)

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop]
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })

  return obj
}
