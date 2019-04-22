import { RegisterService } from "services/RegisterService";
import { Router } from "aurelia-router";
import { autoinject } from "aurelia-framework";

@autoinject()
export class Register {
    public login: string;
    public password: string;

    constructor(private registerService: RegisterService, private router: Router) { }

    submit() {
        this.registerService.register(this.login, this.password).then((response) => {
            response.json().then((data) => {
                if (data == null) {
                    return;
                }
                if (data.result === 'ok') {
                    this.router.navigateToRoute('login');
                }
            });
        });
    }
}
