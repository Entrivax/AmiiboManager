import { Interceptor } from "aurelia-fetch-client";
import { autoinject } from "aurelia-framework";
import { SessionService } from "services/SessionService";

@autoinject()
export class SessionInterceptor implements Interceptor {
    constructor(private sessionService: SessionService) { }

    request(request: Request) : Request | Response | Promise<Request | Response> {
        let session = this.sessionService.getSession();
        if (session)
            request.headers.set('Authorization', session);
        return request;
    }
}
