import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {AuthService} from 'app/core/auth/auth.service';
import {BaseHttpInterceptor} from './base-http-interceptor';

@Injectable()
export class AuthInterceptor extends BaseHttpInterceptor {
    /**
     * Constructor
     *
     * @param {AuthService} _authService
     */
    constructor(
        private _authService: AuthService
    ) {
        super();
    }

    support(request: HttpRequest<any>): boolean {
        return !request.url.includes('auth/refresh-access-token');
    }

    handle(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Проверка статуса авторизации пользователя
        return this._authService.isAuth().pipe(
            switchMap((authenticated) => {
                let newReq = request.clone();
                // Если пользователь авторизован - в устанавливается заголовок с токеном доступа
                if (authenticated) {
                    newReq = request.clone({
                        headers: request.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
                    });
                }

                // Отправка запроса
                return next.handle(newReq).pipe(
                    catchError((error) => {
                        // Catch "401 Unauthorized" responses
                        if (error instanceof HttpErrorResponse && error.status === 401) {
                            // Sign out
                            this._authService.signOut();
                            // Reload the app
                            location.reload();
                        }
                        return throwError(error);
                    })
                );
            })
        );
    }
}
