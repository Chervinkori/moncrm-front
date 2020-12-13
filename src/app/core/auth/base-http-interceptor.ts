import {Observable} from 'rxjs';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

export abstract class BaseHttpInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.support(request)) {
            return next.handle(request);
        }

        return this.handle(request, next);
    }

    /**
     * Проверяет поддерживает ли интерцептор данный запрос.
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
