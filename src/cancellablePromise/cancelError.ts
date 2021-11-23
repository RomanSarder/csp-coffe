export class CancelError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = 'CancelError';
    }
}

export const isCancelError = (error: any): error is CancelError =>
    error instanceof Error && error instanceof CancelError;
