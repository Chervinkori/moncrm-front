import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot,
    UrlSegment,
    UrlTree
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from 'app/core/auth/auth.service';
import {switchMap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(
        private _authService: AuthService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Проверяет статус авторизации пользователя в системе.
     * Если пользователь не авторизован отправляет запрос на обновление токена доступа.
     *
     * @param redirectURL
     * @private
     */
    private _check(redirectURL): Observable<boolean> {
        return this._authService.isAuth()
            .pipe(
                switchMap((authenticated) => {
                    if (!authenticated) {
                        // Выходит из системы
                        this._authService.signOut();
                        // Перенаправление на страницу авторизации
                        this._router.navigate(['sign-in'], {queryParams: {redirectURL}});

                        return of(false);
                    }

                    return of(true);
                })
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can activate
     *
     * @param route
     * @param state
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let redirectUrl = state.url;

        if (redirectUrl === '/sign-out') {
            redirectUrl = '/';
        }

        return this._check(redirectUrl);
    }

    /**
     * Can activate child
     *
     * @param childRoute
     * @param state
     */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let redirectUrl = state.url;

        if (redirectUrl === '/sign-out') {
            redirectUrl = '/';
        }

        return this._check(redirectUrl);
    }

    /**
     * Can load
     *
     * @param route
     * @param segments
     */
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        return this._check('/');
    }
}
