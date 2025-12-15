/**
 * Function Composition
 */

export const compose = <T>(...fns: Array<(arg: T) => T>) => (x: T) =>
  fns.reduceRight((acc, fn) => fn(acc), x)

export const pipe = <T>(...fns: Array<(arg: T) => T>) => (x: T) =>
  fns.reduce((acc, fn) => fn(acc), x)
