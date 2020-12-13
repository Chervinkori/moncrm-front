import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {AuthUtils} from 'app/core/auth/auth.utils';

@Injectable()
export class AuthService {
    private authenticated: boolean;
    private enableRefreshAccessToken: boolean;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        this.authenticated = false;
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
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string, password: string }): Observable<any> {
        return this._httpClient.post('backend/auth/sign-in', credentials).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.access_token;
                // Set the authenticated flag to true
                this.authenticated = true;

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    refreshAccessToken(): Observable<boolean> {
        // Renew token
        return this._httpClient.post('backend/auth/refresh-access-token', {}).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.access_token;
                // Set the authenticated flag to true
                this.authenticated = true;

                // Return true
                return of(true);
            }),
            catchError(() => {
                // Return false
                return of(false);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('access_token');

        // TODO ???
        return this._httpClient.get('backend/auth/sign-out').pipe(
            switchMap(() => {
                // Set the authenticated flag to false
                this.authenticated = false;

                return of(true);
            }),
            catchError(() => {
                return of(false);
            })
        );
    }

    /**
     * Check the authentication status
     */
    isAuth(): Observable<boolean> {
        console.log('isAuth');

        // Если нет токена доступа - обновляет токен доступа
        if (!this.accessToken) {
            if (this.enableRefreshAccessToken) {
                console.log('Если нет токена доступа - обновляет токен доступа');
                this.enableRefreshAccessToken = false;
                // Попытка обновить токен доступа
                return this.refreshAccessToken();
            }

            return of(false);
        }

        // Если токена доступа истек (с запасом в 300 секунд) - обновляет токен доступа
        if (AuthUtils.isTokenExpired(this.accessToken, 300)) {
            console.log('Если токена доступа истек (с запасом в 300 секунд) - обновляет токен доступа');
            this.enableRefreshAccessToken = false;
            // Попытка обновить токен доступа
            return this.refreshAccessToken();
        }

        console.log('Пользователь авторизован');
        // Токен доступа есть и не истек
        return of(true);
    }
}
