import { CancelError } from '../entity/cancelError';

export const isCancelError = (error: any): error is CancelError =>
    error instanceof Error && error instanceof CancelError;
