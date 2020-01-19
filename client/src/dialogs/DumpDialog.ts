import { DialogController } from 'aurelia-dialog'
import { autoinject } from 'aurelia-framework'
import { AmiibombService } from 'services/AmiibombService'
import { AmiiboService } from 'services/AmiiboService'

@autoinject()
export class DumpDialog {
    amiibombuinoAddress: string
    waitingForAmiibo: boolean
    readingAmiibo: boolean
    uploadingAmiibo: boolean
    constructor (public controller: DialogController, private amiibombService: AmiibombService, private amiiboService: AmiiboService) { }

    activate () {
        this.waitingForAmiibo = false
        this.uploadingAmiibo = false
        let address = localStorage.getItem('amiibombuinoAddress')
        if (address != null) {
            this.amiibombuinoAddress = address
        }
    }

    deactivate () {
        this.waitingForAmiibo = false
    }

    async dump () {
        this.waitingForAmiibo = true
        while (this.waitingForAmiibo) {
            if (await this.isAmiiboHere()) {
                this.waitingForAmiibo = false
                this.readingAmiibo = true
                let dumpResponse = await this.amiibombService.dumpAmiibo(this.amiibombuinoAddress?.length ?? 0 >= 1 ? this.amiibombuinoAddress : 'http://amiibomb.local/')
                if (dumpResponse.status !== 200) {
                    console.error(dumpResponse)
                    this.readingAmiibo = false
                    return
                }
                let dumpResult = await dumpResponse.text()
                let dump = []
                for (let i = 0; i < dumpResult.length; i += 2) {
                    dump.push(Number.parseInt(dumpResult.charAt(i) + dumpResult.charAt(i + 1), 16))
                }
                this.readingAmiibo = false
                this.uploadingAmiibo = true
                let uploadedAmiiboResponse = await this.uploadAmiibo(dump)
                this.uploadingAmiibo = false
                if (uploadedAmiiboResponse.status === 200) {
                    this.controller.ok()
                    try {
                        await this.amiibombService.halt(this.amiibombuinoAddress?.length ?? 0 >= 1 ? this.amiibombuinoAddress : 'http://amiibomb.local/')
                    } catch (err) {
                        console.warn(err)
                    }
                } else {
                    console.error(uploadedAmiiboResponse)
                    this.uploadingAmiibo = false
                    return
                }
            } else {
                await new Promise(resolve => setTimeout(() => resolve(), 50))
            }
        }
    }

    private async isAmiiboHere () {
        let response = await this.amiibombService.isAmiiboHere(this.amiibombuinoAddress?.length ?? 0 >= 1 ? this.amiibombuinoAddress : 'http://amiibomb.local/')
        if (response.status === 200) {
            let res = await response.text()
            return res === 'YES'
        }
        return false
    }

    private async uploadAmiibo (dump: number[]) {
        return await this.amiiboService.postAmiibo(dump)
    }
}