export function isGenerator(value: any | Generator): value is Generator {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof value[Symbol.iterator] === 'function'
    );
}
