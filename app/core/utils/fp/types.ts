/**
 * Type definitions for functional programming utilities
 */

// Unary function type
export type UnaryFn<T, R> = (arg: T) => R

// Function with any number of parameters
export type Fn<T extends any[], R> = (...args: T) => R

// Curried function types
export type Curry1<T1, R> = (t1: T1) => R
export type Curry2<T1, T2, R> = (t1: T1) => (t2: T2) => R
export type Curry3<T1, T2, T3, R> = (t1: T1) => (t2: T2) => (t3: T3) => R
export type Curry4<T1, T2, T3, T4, R> = (t1: T1) => (t2: T2) => (t3: T3) => (t4: T4) => R

// Maybe monad type
export type Maybe<T> = Some<T> | None

export interface Some<T> {
  readonly _tag: 'Some'
  readonly value: T
}

export interface None {
  readonly _tag: 'None'
}

// Either monad type
export type Either<L, R> = Left<L> | Right<R>

export interface Left<L> {
  readonly _tag: 'Left'
  readonly value: L
}

export interface Right<R> {
  readonly _tag: 'Right'
  readonly value: R
}

// Predicate type
export type Predicate<T> = (value: T) => boolean

// Comparator type
export type Comparator<T> = (a: T, b: T) => number

// Mapper type
export type Mapper<T, U> = (value: T) => U
