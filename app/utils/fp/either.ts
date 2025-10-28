/**
 * Either monad for error handling
 *
 * Represents a value of one of two possible types (a disjoint union)
 * Either is either Left (error/failure) or Right (success)
 * By convention: Left = Error, Right = Success
 */

import type { Either, Left, Right, Mapper } from './types'

/**
 * Create a Left value (error)
 */
function left<L, R = never>(value: L): Left<L> {
  return { _tag: 'Left', value }
}

/**
 * Create a Right value (success)
 */
function right<R, L = never>(value: R): Right<R> {
  return { _tag: 'Right', value }
}

/**
 * Check if Either is Left
 */
function isLeft<L, R>(either: Either<L, R>): either is Left<L> {
  return either._tag === 'Left'
}

/**
 * Check if Either is Right
 */
function isRight<L, R>(either: Either<L, R>): either is Right<R> {
  return either._tag === 'Right'
}

/**
 * Create Either from a nullable value
 */
function fromNullable<R, L>(onNull: L): (value: R | null | undefined) => Either<L, R> {
  return (value) => (value != null ? right(value) : left(onNull))
}

/**
 * Create Either from a predicate
 */
function fromPredicate<R, L>(
  predicate: (value: R) => boolean,
  onFalse: L
): (value: R) => Either<L, R> {
  return (value) => (predicate(value) ? right(value) : left(onFalse))
}

/**
 * Try-catch wrapper that returns Either
 */
function tryCatch<R, L = Error>(
  fn: () => R,
  onError: (error: unknown) => L = (e) => e as L
): Either<L, R> {
  try {
    return right(fn())
  } catch (error) {
    return left(onError(error))
  }
}

/**
 * Async try-catch wrapper that returns Either
 */
async function tryCatchAsync<R, L = Error>(
  fn: () => Promise<R>,
  onError: (error: unknown) => L = (e) => e as L
): Promise<Either<L, R>> {
  try {
    const result = await fn()
    return right(result)
  } catch (error) {
    return left(onError(error))
  }
}

/**
 * Map over Right value
 */
function map<L, R, R2>(fn: Mapper<R, R2>): (either: Either<L, R>) => Either<L, R2> {
  return (either) => (isRight(either) ? right(fn(either.value)) : either)
}

/**
 * Map over Left value
 */
function mapLeft<L, R, L2>(fn: Mapper<L, L2>): (either: Either<L, R>) => Either<L2, R> {
  return (either) => (isLeft(either) ? left(fn(either.value)) : either)
}

/**
 * Flat map over Right value (chain)
 */
function flatMap<L, R, R2>(
  fn: (value: R) => Either<L, R2>
): (either: Either<L, R>) => Either<L, R2> {
  return (either) => (isRight(either) ? fn(either.value) : either)
}

/**
 * Get Right value or return default
 */
function getOrElse<L, R>(defaultValue: R): (either: Either<L, R>) => R {
  return (either) => (isRight(either) ? either.value : defaultValue)
}

/**
 * Get Right value or compute default
 */
function getOrElseL<L, R>(defaultFn: (left: L) => R): (either: Either<L, R>) => R {
  return (either) => (isRight(either) ? either.value : defaultFn(either.value))
}

/**
 * Fold Either into a single value
 */
function fold<L, R, T>(
  onLeft: (left: L) => T,
  onRight: (right: R) => T
): (either: Either<L, R>) => T {
  return (either) => (isLeft(either) ? onLeft(either.value) : onRight(either.value))
}

/**
 * Swap Left and Right
 */
function swap<L, R>(either: Either<L, R>): Either<R, L> {
  return isLeft(either) ? right(either.value) : left(either.value)
}

/**
 * Execute side effect if Right
 */
function tap<L, R>(fn: (value: R) => void): (either: Either<L, R>) => Either<L, R> {
  return (either) => {
    if (isRight(either)) {
      fn(either.value)
    }
    return either
  }
}

/**
 * Execute side effect if Left
 */
function tapLeft<L, R>(fn: (value: L) => void): (either: Either<L, R>) => Either<L, R> {
  return (either) => {
    if (isLeft(either)) {
      fn(either.value)
    }
    return either
  }
}

/**
 * Convert to Maybe (discards Left value)
 */
function toMaybe<L, R>(either: Either<L, R>): import('./types').Maybe<R> {
  return isRight(either)
    ? { _tag: 'Some', value: either.value }
    : { _tag: 'None' }
}

/**
 * Combine multiple Eithers (all must be Right)
 */
function all<L, R>(eithers: Either<L, R>[]): Either<L, R[]> {
  const results: R[] = []

  for (const either of eithers) {
    if (isLeft(either)) {
      return either
    }
    results.push(either.value)
  }

  return right(results)
}

/**
 * Chain multiple Either operations
 */
class EitherBuilder<L, R> {
  constructor(private readonly either: Either<L, R>) {}

  static right<R, L = never>(value: R): EitherBuilder<L, R> {
    return new EitherBuilder(right(value))
  }

  static left<L, R = never>(value: L): EitherBuilder<L, R> {
    return new EitherBuilder(left(value))
  }

  static tryCatch<R, L = Error>(
    fn: () => R,
    onError?: (error: unknown) => L
  ): EitherBuilder<L, R> {
    return new EitherBuilder(tryCatch(fn, onError))
  }

  static async tryCatchAsync<R, L = Error>(
    fn: () => Promise<R>,
    onError?: (error: unknown) => L
  ): Promise<EitherBuilder<L, R>> {
    const result = await tryCatchAsync(fn, onError)
    return new EitherBuilder(result)
  }

  map<R2>(fn: Mapper<R, R2>): EitherBuilder<L, R2> {
    return new EitherBuilder(map(fn)(this.either))
  }

  mapLeft<L2>(fn: Mapper<L, L2>): EitherBuilder<L2, R> {
    return new EitherBuilder(mapLeft(fn)(this.either))
  }

  flatMap<R2>(fn: (value: R) => Either<L, R2>): EitherBuilder<L, R2> {
    return new EitherBuilder(flatMap(fn)(this.either))
  }

  tap(fn: (value: R) => void): EitherBuilder<L, R> {
    return new EitherBuilder(tap(fn)(this.either))
  }

  tapLeft(fn: (value: L) => void): EitherBuilder<L, R> {
    return new EitherBuilder(tapLeft(fn)(this.either))
  }

  getOrElse(defaultValue: R): R {
    return getOrElse(defaultValue)(this.either)
  }

  getOrElseL(defaultFn: (left: L) => R): R {
    return getOrElseL(defaultFn)(this.either)
  }

  fold<T>(onLeft: (left: L) => T, onRight: (right: R) => T): T {
    return fold(onLeft, onRight)(this.either)
  }

  swap(): EitherBuilder<R, L> {
    return new EitherBuilder(swap(this.either))
  }

  isLeft(): boolean {
    return isLeft(this.either)
  }

  isRight(): boolean {
    return isRight(this.either)
  }

  toEither(): Either<L, R> {
    return this.either
  }
}

/**
 * Either monad namespace
 *
 * @example
 * // Basic error handling
 * Either.tryCatch(() => JSON.parse(data))
 *   .map(processData)
 *   .fold(handleError, handleSuccess)
 *
 * // Async error handling
 * const result = await Either.tryCatchAsync(async () => {
 *   const response = await fetch(url)
 *   return response.json()
 * })
 * result.fold(
 *   error => console.error(error),
 *   data => console.log(data)
 * )
 *
 * // With custom error mapping
 * Either.tryCatch(
 *   () => riskyOperation(),
 *   (error) => `Failed: ${error}`
 * ).getOrElse(defaultValue)
 */
export const Either = {
  right: EitherBuilder.right,
  left: EitherBuilder.left,
  tryCatch: EitherBuilder.tryCatch,
  tryCatchAsync: EitherBuilder.tryCatchAsync,
  fromNullable,
  fromPredicate,
  isLeft,
  isRight,
  map,
  mapLeft,
  flatMap,
  getOrElse,
  getOrElseL,
  fold,
  swap,
  tap,
  tapLeft,
  toMaybe,
  all,
}

// Export types
export type { Either, Left, Right }
