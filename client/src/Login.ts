import { LoginService } from 'services/LoginService';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class Login {
    public heading: string = 'Welcome to AmiiboManager!';
    public login: string;
    public password: string;

    constructor(private loginService: LoginService) { }

    public submit() {
        this.loginService.login(this.login, this.password);
    }
}