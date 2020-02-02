import { LoginService } from 'services/LoginService'
import { Router } from 'aurelia-router'
import { bindable, autoinject } from 'aurelia-framework'

@autoinject()
export class NavBar {
    @bindable router: Router

    constructor (private loginService: LoginService) { }

    logout() {
        this.loginService.logout().then(() => {
            this.router.navigateToRoute('login')
        }, (err) => {
            console.error(err)
        })
    }
}