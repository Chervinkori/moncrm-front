import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {AuthService} from 'app/core/auth/auth.service';
import {BaseHttpInterceptor} from '../../interceptor/base-http-interceptor';
import {Router} from '@angular/router';

@Injectable()
export class AuthInterceptor extends BaseHttpInterceptor {
    constructor(
        private _authService: AuthService,
        private _router: Router
    ) {
        super();
    }

    /**
     * Проверка поддерживает ли интерцептор данный запрос.
     *
     * @param request
     */
    support(request: HttpRequest<any>): boolean {
        return !request.url.includes('auth/refresh-access-token');
    }

    /**
     * Логика интерцептора.
     *
     * @param request
     * @param next
     */
    handle(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Проверка статуса авторизации пользователя
        return this._authService.isAuth().pipe(
            switchMap((authenticated) => {
                let newRequest = request.clone();
                // Если пользователь авторизован
                if (authenticated) {
                    // Обновляет токен в родительском запросе
                    newRequest = this.injectAccessToken(request);
                }

                // Отправка запроса
                return next.handle(newRequest).pipe(
                    catchError((error) => {
                        // Обработка ответа "401 Unauthorized"
                        if (error instanceof HttpErrorResponse && error.status === 401) {
                            return this.refreshAccessTokenAndResend(request, next);
                        }

                        return throwError(error);
                    })
                );
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Обновляет токен доступа и переотправляет запрос.
     * Если обновление токена не успешное - выходит из системы и перенаправляет на страницу авторизации.
     *
     * @param request
     * @param next
     * @private
     */
    private refreshAccessTokenAndResend(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        // Если включено обновление токена доступа
        if (this._authService.enableRefreshAccessToken) {
            // Отправляет запрос на обновление токена доступа
            return this._authService.refreshAccessToken().pipe(
                switchMap((refreshing) => {
                    // Если токен доступа обновлен успешно
                    if (refreshing) {
                        // Обновляет токен в родительском запросе
                        const newRequest = this.injectAccessToken(request);

                        // Переотправялет родительский запрос
                        return next.handle(newRequest);
                    }

                    // Если токен доступа не обновился - выход из системы
                    return this.signOut();
                })
            );
        }

        // Если обновление токена доступа выключено - выход из системы
        return this.signOut();
    }

    /**
     * Добавляет в запрос токен доступа.
     *
     * @param request
     * @private
     */
    private injectAccessToken(request: HttpRequest<any>): HttpRequest<any> {
        return request.clone({
            headers: request.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
        });
    }

    /**
     * Выходит из системы и перенаправляет на страницу авторизации.
     *
     * @private
     */
    private signOut(): Observable<any> {
        // Если обновление токена доступа выключено - выход из системы
        this._authService.signOut();
        // Переход на страницу авторизации
        this._router.navigate(['sign-in']);

        return EMPTY;
    }
}
