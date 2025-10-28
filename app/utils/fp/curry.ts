/**
 * Currying utilities
 *
 * Transform multi-argument functions into a series of single-argument functions
 */

import type { Curry2, Curry3, Curry4 } from './types'

/**
 * Curry a function with 2 parameters
 *
 * @example
 * const add = (a: number, b: number) => a + b
 * const curriedAdd = curry2(add)
 * curriedAdd(1)(2) // 3
 * curriedAdd(1, 2) // 3
 */
export function curry2<T1, T2, R>(fn: (t1: T1, t2: T2) => R): Curry2<T1, T2, R> & ((t1: T1, t2: T2) => R) {
  const curried = (t1: T1) => (t2: T2) => fn(t1, t2)

  return Object.assign(
    (t1: T1, t2?: T2) => {
      if (arguments.length >= 2) {
        return fn(t1, t2 as T2)
      }
      return curried(t1)
    },
    { curried }
  ) as any
}

/**
 * Curry a function with 3 parameters
 *
 * @example
 * const sum3 = (a: number, b: number, c: number) => a + b + c
 * const curriedSum = curry3(sum3)
 * curriedSum(1)(2)(3) // 6
 * curriedSum(1, 2)(3) // 6
 * curriedSum(1)(2, 3) // 6
 * curriedSum(1, 2, 3) // 6
 */
export function curry3<T1, T2, T3, R>(
  fn: (t1: T1, t2: T2, t3: T3) => R
): Curry3<T1, T2, T3, R> & ((t1: T1, t2?: T2, t3?: T3) => any) {
  const curried = (t1: T1) => (t2: T2) => (t3: T3) => fn(t1, t2, t3)

  return Object.assign(
    (t1: T1, t2?: T2, t3?: T3) => {
      if (arguments.length >= 3) {
        return fn(t1, t2 as T2, t3 as T3)
      }
      if (arguments.length === 2) {
        return (t3: T3) => fn(t1, t2 as T2, t3)
      }
      return curried(t1)
    },
    { curried }
  ) as any
}

/**
 * Curry a function with 4 parameters
 *
 * @example
 * const sum4 = (a: number, b: number, c: number, d: number) => a + b + c + d
 * const curriedSum = curry4(sum4)
 * curriedSum(1)(2)(3)(4) // 10
 * curriedSum(1, 2, 3, 4) // 10
 */
export function curry4<T1, T2, T3, T4, R>(
  fn: (t1: T1, t2: T2, t3: T3, t4: T4) => R
): Curry4<T1, T2, T3, T4, R> & ((t1: T1, t2?: T2, t3?: T3, t4?: T4) => any) {
  const curried = (t1: T1) => (t2: T2) => (t3: T3) => (t4: T4) => fn(t1, t2, t3, t4)

  return Object.assign(
    (t1: T1, t2?: T2, t3?: T3, t4?: T4) => {
      const argCount = arguments.length

      if (argCount >= 4) {
        return fn(t1, t2 as T2, t3 as T3, t4 as T4)
      }
      if (argCount === 3) {
        return (t4: T4) => fn(t1, t2 as T2, t3 as T3, t4)
      }
      if (argCount === 2) {
        return (t3: T3) => (t4: T4) => fn(t1, t2 as T2, t3, t4)
      }
      return curried(t1)
    },
    { curried }
  ) as any
}

/**
 * Generic curry function for any arity
 * Less type-safe but more flexible
 *
 * @example
 * const sum = (...args: number[]) => args.reduce((a, b) => a + b, 0)
 * const curriedSum = curry(sum, 3)
 * curriedSum(1)(2)(3) // 6
 */
export function curry<T extends any[], R>(fn: (...args: T) => R, arity: number = fn.length) {
  return function curried(...args: any[]): any {
    if (args.length >= arity) {
      return fn(...(args as T))
    }

    return (...nextArgs: any[]) => curried(...args, ...nextArgs)
  }
}

/**
 * Partial application - fix some arguments of a function
 *
 * @example
 * const add3 = (a: number, b: number, c: number) => a + b + c
 * const add5 = partial(add3, 2, 3)
 * add5(4) // 9
 */
export function partial<T extends any[], R>(fn: (...args: T) => R, ...fixedArgs: any[]) {
  return (...remainingArgs: any[]) => fn(...(fixedArgs.concat(remainingArgs) as T))
}

/**
 * Partial application from the right
 *
 * @example
 * const divide = (a: number, b: number) => a / b
 * const divideBy2 = partialRight(divide, 2)
 * divideBy2(10) // 5
 */
export function partialRight<T extends any[], R>(fn: (...args: T) => R, ...fixedArgs: any[]) {
  return (...remainingArgs: any[]) => fn(...(remainingArgs.concat(fixedArgs) as T))
}

/**
 * Create a unary function from any function (only takes first argument)
 *
 * @example
 * const parseIntUnary = unary(parseInt)
 * ['1', '2', '3'].map(parseIntUnary) // [1, 2, 3]
 * // Without unary: ['1', '2', '3'].map(parseInt) // [1, NaN, NaN]
 */
export function unary<T, R>(fn: (arg: T, ...rest: any[]) => R): (arg: T) => R {
  return (arg) => fn(arg)
}

/**
 * Create a binary function from any function (only takes first two arguments)
 *
 * @example
 * const binaryMax = binary(Math.max)
 * binaryMax(1, 2, 3, 4, 5) // 2
 */
export function binary<T1, T2, R>(fn: (arg1: T1, arg2: T2, ...rest: any[]) => R): (arg1: T1, arg2: T2) => R {
  return (arg1, arg2) => fn(arg1, arg2)
}

/**
 * Variadic curry - automatically curry based on arity
 *
 * @example
 * const add = autoCurry((a: number, b: number) => a + b)
 * add(1)(2) // 3
 * add(1, 2) // 3
 */
export function autoCurry<T extends any[], R>(fn: (...args: T) => R): (...args: any[]) => any {
  return curry(fn, fn.length)
}
