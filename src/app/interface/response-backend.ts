import {HttpErrorResponse} from '@angular/common/http';

/**
 * Успешный ответ от бэкенда
 */
export interface SuccessResponse {
    readonly meta?: any;
    readonly message?: string;
    readonly data?: any;
}

/**
 * Ошибочный ответ от бэкенда
 */
export interface ErrorResponse extends HttpErrorResponse {
    readonly error: {
        message?: string;
        data?: {
            field?: string;
            message?: string;
            value?: string;
        }[];
    };
}
