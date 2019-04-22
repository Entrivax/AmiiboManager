import { SessionService } from 'services/SessionService';
import { LoginService } from 'services/LoginService';
import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';

@autoinject()
export class Login {
    public login: string;
    public password: string;

    constructor(private loginService: LoginService, private sessionService: SessionService, private router: Router) { }

    public submit() {
        this.loginService.login(this.login, this.password).then((response) => {
            response.json().then((data) => {
                if (data == null) {
                    return;
                }
                this.sessionService.setSession(data.sessionId);
                this.router.navigateToRoute('amiibos');
            });
        });
    }
}
