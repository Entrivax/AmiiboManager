import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class LoginService {
    constructor(private httpClient: HttpClient) { }

    login(login: string, password: string): Promise<Response> {
        return this.httpClient.fetch('./api/login', {
            method: 'post',
            body: json({
                login,
                password
            })
        })
    }
}
