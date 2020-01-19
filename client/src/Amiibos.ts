import { AmiiboService } from './services/AmiiboService'
import { autoinject } from 'aurelia-framework'
import { DialogService } from 'aurelia-dialog'
import { saveAs } from 'file-saver'
import { FlashDialog } from 'dialogs/FlashDialog'
import { AmiiboUploadDialog } from 'dialogs/AmiiboUploadDialog'
import { DumpDialog } from 'dialogs/DumpDialog'

@autoinject()
export class Amiibos {
    public amiibos: any[]

    constructor (private amiiboService: AmiiboService, private dialogService: DialogService) { }

    activate (params, routeConfig, navigationInstruction) {
        this.load()
    }

    private load () {
        this.amiiboService.getAmiibos().then((response) => {
            response.json().then((amiibos) => {
                this.amiibos = amiibos
            })
        })
    }

    uploadAmiibo () {
        this.dialogService.open({ viewModel: AmiiboUploadDialog, lock: false })
            .whenClosed(result => {
                if (!result.wasCancelled) {
                    this.load()
                }
            })
    }

    dumpAmiibo () {
        this.dialogService.open({ viewModel: DumpDialog, lock: false })
            .whenClosed(result => {
                if (!result.wasCancelled) {
                    this.load()
                }
            })
    }

    downloadAmiibo (amiibo: any) {
        this.amiiboService.getAmiibo(amiibo.id)
            .then(response => response.json())
            .then(amiibo => {
                let blob = new Blob([new Uint8Array(amiibo.raw)], { type: "octet/stream" })
                saveAs(blob, [amiibo.characterName, amiibo.name].join(' - ') + '.bin', true)
            })
    }

    restoreAmiibo (amiibo: any) {
        this.dialogService.open({ viewModel: FlashDialog, model: { restore: true, id: amiibo.id }, lock: false })
    }

    deleteAmiibo (amiibo: any) {
        this.amiiboService.deleteAmiibo(amiibo.id)
            .then(() => this.load())
    }
}
