import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from 'aurelia-framework';
import { SessionService } from 'services/SessionService'

@autoinject()
export class LoginService {
    constructor(private httpClient: HttpClient, private sessionService: SessionService) { }

    login(login: string, password: string): Promise<Response> {
        return this.httpClient.fetch('./api/login', {
            method: 'post',
            body: json({
                login,
                password
            })
        })
    }

    logout(): Promise<Response> {
        if (this.sessionService.getSession() === null) {
            return
        }
        return this.httpClient.fetch('./api/logout', {
            method: 'delete'
        })
    }
}
