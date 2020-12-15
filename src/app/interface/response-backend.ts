/**
 * Интерфейс структуры ответа от бэкенда.
 */
export interface ResponseBackend {
    success: boolean;
    meta?: any;
    message?: string;
    data?: any;
}
