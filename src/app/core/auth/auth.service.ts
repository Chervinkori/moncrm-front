import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {SuccessResponse} from '../../interface/response-backend';
import {JwtUtils} from '../../util/jwt.utils';

@Injectable()
export class AuthService {
    enableRefreshAccessToken: boolean;

    constructor(
        private _httpClient: HttpClient
    ) {
        this.enableRefreshAccessToken = true;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('access_token', token);
    }

    get accessToken(): string {
        return localStorage.getItem('access_token');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Авторизует пользователя в системе.
     *
     * @param credentials
     */
    signIn(credentials: { email: string, password: string }): Observable<any> {
        return this._httpClient.post('backend/auth/sign-in', credentials).pipe(
            switchMap((response: SuccessResponse) => {
                this.accessToken = response.data.access_token;
                // Включает обновление токена доступа
                this.enableRefreshAccessToken = true;

                return of(response);
            })
        );
    }

    /**
     * Обновляет токен доступа.
     */
    refreshAccessToken(): Observable<boolean> {
        // Renew token
        return this._httpClient.post('backend/auth/refresh-access-token', {}).pipe(
            switchMap((response: SuccessResponse) => {
                this.accessToken = response.data.access_token;
                // Включает обновление токена доступа
                this.enableRefreshAccessToken = true;

                return of(true);
            }),
            catchError(() => {
                // Отключает обновление токена доступа
                this.enableRefreshAccessToken = false;

                return of(false);
            })
        );
    }

    /**
     * Разлогинивает пользователя.
     */
    signOut(): Observable<boolean> {
        // Удаляет токен доступа
        localStorage.removeItem('access_token');
        // Отключает обновление токена доступа
        this.enableRefreshAccessToken = false;
        // Разлогин в бэкенде
        this._httpClient.get('backend/auth/sign-out').subscribe();

        return of(true);
    }

    /**
     * Проверяет статус авторизации пользователя.
     */
    isAuth(): Observable<boolean> {
        // Если нет токена доступа или он не валидный - обновляет токен доступа
        if (!this.accessToken || !JwtUtils.isTokenValid(this.accessToken)) {
            if (this.enableRefreshAccessToken) {
                // Попытка обновить токен доступа
                return this.refreshAccessToken();
            }

            return of(false);
        }

        // Если токена доступа истек (с запасом в 300 секунд) - обновляет токен доступа
        if (JwtUtils.isTokenExpired(this.accessToken, 300)) {
            if (this.enableRefreshAccessToken) {
                // Попытка обновить токен доступа
                return this.refreshAccessToken();
            }

            return of(false);
        }

        // Токен доступа есть и не истек
        return of(true);
    }
}
