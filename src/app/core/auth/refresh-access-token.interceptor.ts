import {Injectable} from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseHttpInterceptor} from './base-http-interceptor';

@Injectable()
export class RefreshAccessTokenInterceptor extends BaseHttpInterceptor {

    constructor() {
        super();
    }

    support(request: HttpRequest<any>): boolean {
        return request.url.includes('auth/refresh-access-token');
    }

    handle(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request);
    }
}
