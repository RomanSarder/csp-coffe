export function constant<T = any>(value: T): (...args: readonly any[]) => T {
    return () => value;
}
