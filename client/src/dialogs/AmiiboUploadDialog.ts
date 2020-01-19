import { autoinject, computedFrom } from 'aurelia-framework'
import { DialogController } from 'aurelia-dialog'
import { AmiiboService } from 'services/AmiiboService'

@autoinject()
export class AmiiboUploadDialog {
    public inputAmiiboFile: FileList
    public uploadingAmiibo: boolean

    @computedFrom('inputAmiiboFile')
    public get fileName (): string {
        return this.inputAmiiboFile?.item(0)?.name
    }

    constructor (public controller: DialogController, private amiiboService: AmiiboService) { }

    uploadAmiibo () {
        if (this.inputAmiiboFile != null && this.inputAmiiboFile.item(0)) {
            let file = this.inputAmiiboFile.item(0)
            let reader = new FileReader()
            reader.onload = () => {
                if (this.uploadingAmiibo) {
                    return
                }
                this.uploadingAmiibo = true
                let result = <ArrayBuffer>reader.result
                let array = new Uint8Array(result)
                let raw = Array.from(array)
                this.amiiboService.postAmiibo(raw).then((response) => {
                    this.uploadingAmiibo = false
                    if (response.status < 400) {
                        this.controller.ok()
                    }
                }, (err) => {
                    this.uploadingAmiibo = false
                })
            }
            reader.readAsArrayBuffer(file)
        }
    }
}