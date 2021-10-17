export const hasKey = <T extends Record<string, any>>(
    obj: T,
    k: keyof any,
): k is keyof T => k in obj;
