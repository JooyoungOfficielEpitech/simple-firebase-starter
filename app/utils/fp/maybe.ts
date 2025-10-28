/**
 * Maybe Monad (Null Safety)
 */

export class Maybe<T> {
  private constructor(private value: T | null) {}

  static of<T>(value: T | null): Maybe<T> {
    return new Maybe(value)
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    return this.value === null ? Maybe.of(null) : Maybe.of(fn(this.value))
  }

  getOrElse(defaultValue: T): T {
    return this.value === null ? defaultValue : this.value
  }

  isNothing(): boolean {
    return this.value === null
  }
}
