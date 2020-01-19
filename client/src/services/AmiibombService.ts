import { HttpClient } from 'aurelia-fetch-client'
import { autoinject } from 'aurelia-framework'

@autoinject()
export class AmiibombService {
    constructor (private httpClient: HttpClient) { }

    isAmiiboHere (amiibombAddress: string): Promise<Response> {
        return this.httpClient.fetch((amiibombAddress.endsWith('/') ? amiibombAddress : `${amiibombAddress}/`) + 'NTAG_HERE', {
            method: 'get'
        })
    }

    getUid (amiibombAddress: string): Promise<Response> {
        return this.httpClient.fetch((amiibombAddress.endsWith('/') ? amiibombAddress : `${amiibombAddress}/`) + 'GET_NTAG_UID', {
            method: 'get'
        })
    }

    dumpAmiibo (amiibombAddress: string): Promise<Response> {
        return this.httpClient.fetch((amiibombAddress.endsWith('/') ? amiibombAddress : `${amiibombAddress}/`) + 'READ_AMIIBO', {
            method: 'get'
        })
    }

    halt (amiibombAddress: string): Promise<Response> {
        return this.httpClient.fetch((amiibombAddress.endsWith('/') ? amiibombAddress : `${amiibombAddress}/`) + 'NTAG_HALT', {
            method: 'get'
        })
    }

    restoreAmiibo (amiibombAddress: string, amiiboData: number[]): Promise<Response> {
        let data = new FormData()
        data.append('name', new Blob([new Uint8Array(amiiboData)]))
        return this.httpClient.fetch((amiibombAddress.endsWith('/') ? amiibombAddress : `${amiibombAddress}/`) + 'RESTORE_AMIIBO', {
            method: 'post',
            body: data
        })
    }
}
