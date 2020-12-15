import {Observable} from 'rxjs';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

/**
 * Базовый Http интерцептор.
 */
export abstract class BaseHttpInterceptor implements HttpInterceptor {
    /**
     * @param request
     * @param next
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.support(request)) {
            return next.handle(request);
        }

        return this.handle(request, next);
    }

    /**
     * Проверка поддерживает ли интерцептор данный запрос.
     *
     * @param request
     */
    abstract support(request: HttpRequest<any>): boolean;

    /**
     * Логика интерцептора.
     *
     * @param request
     * @param next
     */
    abstract handle(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
