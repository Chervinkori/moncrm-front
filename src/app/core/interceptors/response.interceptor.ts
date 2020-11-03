import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { catchError } from 'rxjs/operators';
import { ErrorResponse } from '@interfaces/response.interface';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

    constructor() {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {

                if (error instanceof HttpErrorResponse) {

                    switch (error.status) {
                        case 0:
                            return throwError(new ErrorResponse({ title: 'Ошибка соединения с сервером' }));

                        case 429:
                            return throwError(new ErrorResponse({ title: 'Превышено количество запросов к серверу на единицу времени' }));

                        default:
                            return throwError(new ErrorResponse({
                                title: error.error?.error?.title || 'Неизвестная ошибка',
                                details: error.error?.error?.detail || null
                            }));
                    }
                }

                return throwError(error);
            })
        )
    }
}