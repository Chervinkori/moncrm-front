import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    handleError(error: any) {
        if (error instanceof HttpErrorResponse) {
            //тут ловим ошибки прилетевшие с бека, например проверяем на 500				  
            console.error('status code: ', error.status);
            console.error('body:', error.message);
        } else {
            //тут ловим js ошибки на клиенте	          
            console.error('Error message:', error.message);
        }
    }
} 