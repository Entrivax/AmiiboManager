import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from "aurelia-framework";

@autoinject()
export class RegisterService {
    constructor(private httpClient: HttpClient) { }

    register(login: string, password: string): Promise<Response> {
        return this.httpClient.fetch('./api/register', {
            method: 'post',
            body: json({
                login,
                password
            })
        })
    }
}
