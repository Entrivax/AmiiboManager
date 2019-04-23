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

    getAmiibo(id: string): Promise<Response> {
        return this.httpClient.fetch('./api/bins/' + encodeURIComponent(id), {
            method: 'get'
        });
    }

    deleteAmiibo(id: string): Promise<Response> {
        return this.httpClient.fetch('./api/bins/' + encodeURIComponent(id), {
            method: 'delete'
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
