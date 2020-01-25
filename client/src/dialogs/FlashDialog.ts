import { DialogController } from 'aurelia-dialog'
import { autoinject } from 'aurelia-framework'
import { AmiibombService } from 'services/AmiibombService'
import { AmiiboService } from 'services/AmiiboService'

@autoinject()
export class FlashDialog {
    amiibombuinoAddress: string
    restore: boolean
    waitingForAmiibo: boolean
    patchingAmiibo: boolean
    private amiiboId: string
    constructor (public controller: DialogController, private amiibombService: AmiibombService, private amiiboService: AmiiboService) { }

    activate (params: { restore: boolean, id: string }) {
        this.restore = params.restore
        this.amiiboId = params.id
        this.waitingForAmiibo = false
        this.patchingAmiibo = false
        let address = localStorage.getItem('amiibombuinoAddress')
        if (address != null) {
            this.amiibombuinoAddress = address
        }
    }

    deactivate () {
        this.waitingForAmiibo = false
    }

    async flash () {
        this.waitingForAmiibo = true
        while (this.waitingForAmiibo) {
            if (await this.isAmiiboHere()) {
                this.waitingForAmiibo = false
                this.patchingAmiibo = true
                let patchedAmiibo = await this.patchAmiibo()
                let flashResult = this.restore ?
                    await this.amiibombService.restoreAmiibo(this.amiibombuinoAddress?.length ?? 0 >= 1 ? this.amiibombuinoAddress : 'http://amiibomb.local/', patchedAmiibo) :
                    await this.amiibombService.writeAmiibo(this.amiibombuinoAddress?.length ?? 0 >= 1 ? this.amiibombuinoAddress : 'http://amiibomb.local/', patchedAmiibo)
                this.waitingForAmiibo = false
                this.patchingAmiibo = false
                if (flashResult.status === 200) {
                    this.controller.ok()
                    try {
                        await this.amiibombService.halt(this.amiibombuinoAddress?.length ?? 0 >= 1 ? this.amiibombuinoAddress : 'http://amiibomb.local/')
                    } catch (err) {
                        console.warn(err)
                    }
                } else {
                    console.error(flashResult)
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

    private async patchAmiibo () {
        let uid = await this.getUid()
        return await this.amiiboService.patchAmiibo(this.amiiboId, uid)
            .then(response => response.json())
            .then(amiibo => amiibo.data)
    }

    private async getUid () {
        let response = await this.amiibombService.getUid(this.amiibombuinoAddress?.length ?? 0 >= 1 ? this.amiibombuinoAddress : 'http://amiibomb.local/')
        if (response.status === 200) {
            let res = await response.text()
            let uid = []
            for (let i = 0; i < res.length; i+=2) {
                uid.push(Number.parseInt(res.charAt(i) + res.charAt(i + 1), 16))
            }
            return uid
        }
        return null
    }
}
