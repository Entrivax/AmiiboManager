import { HttpClient } from 'aurelia-fetch-client';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';
import { SessionInterceptor } from 'http/SessionInterceptor';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class App {
    public router: Router;

    constructor(httpClient: HttpClient, sessionInterceptor: SessionInterceptor) {
        httpClient.configure(config => {
            config.withInterceptor(sessionInterceptor);
        });
    }

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'AmiiboManager';
        config.map([
            {
                route: ['', 'login'],
                name: 'login',
                moduleId: PLATFORM.moduleName('./Login'),
                nav: true,
                title: 'Login'
            },
            {
                route: ['register'],
                name: 'register',
                moduleId: PLATFORM.moduleName('./Register'),
                nav: true,
                title: 'Register'
            },
            {
                route: 'amiibos',
                name: 'amiibos',
                moduleId: PLATFORM.moduleName('./Amiibos'),
                title: 'Amiibos'
            },
        ]);

        this.router = router;
    }
}
