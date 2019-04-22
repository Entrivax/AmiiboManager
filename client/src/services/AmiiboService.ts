import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class AmiiboService {
    constructor(private httpClient: HttpClient) { }

    getAmiibos(): Promise<Response> {
        return this.httpClient.fetch('./api/bins', {
            method: 'get'
        });
    }

    postAmiibo(data: number[]): Promise<Response> {
        return this.httpClient.fetch('./api/bins', {
            method: 'post',
            body: json({
                raw: data
            })
        });
    }
}
