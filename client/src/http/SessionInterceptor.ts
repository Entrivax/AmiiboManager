import { Interceptor } from "aurelia-fetch-client";
import { autoinject } from "aurelia-framework";
import { SessionService } from "services/SessionService";
import { Router } from 'aurelia-router'

@autoinject()
export class SessionInterceptor implements Interceptor {
    constructor(private sessionService: SessionService, private router: Router) { }

    request(request: Request): Request | Response | Promise<Request | Response> {
        let session = this.sessionService.getSession();
        if (session)
            request.headers.set('Authorization', session);
        return request;
    }

    response(response: Response, request?: Request): Response | Promise<Response> {
        if (response.status === 401) {
            this.router.navigateToRoute('login')
        }
        return response
    }
}
