import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
    public router: Router;

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Aurelia';
        config.map([
            {
                route: ['', 'login'],
                name: 'login',
                moduleId: PLATFORM.moduleName('./Login'),
                nav: true,
                title: 'Login'
            },
        ]);

        this.router = router;
    }
}
