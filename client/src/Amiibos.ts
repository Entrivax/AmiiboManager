import { AmiiboService } from './services/AmiiboService';
import { autoinject } from "aurelia-framework";
import { saveAs } from 'file-saver';

@autoinject()
export class Amiibos {
    public amiibos: any[];
    public inputAmiiboFile: FileList;

    constructor(private amiiboService: AmiiboService) {}

    activate(params, routeConfig, navigationInstruction) {
        this.load();
    }

    private load() {
        this.amiiboService.getAmiibos().then((response) => {
            response.json().then((amiibos) => {
                this.amiibos = amiibos;
            })
        })
    }

    uploadAmiibo() {
        if (this.inputAmiiboFile != null && this.inputAmiiboFile.item(0)) {
            let file = this.inputAmiiboFile.item(0);
            let reader = new FileReader();
            reader.onload = () => {
                let result = <ArrayBuffer>reader.result;
                let array = new Uint8Array(result);
                let raw = Array.from(array);
                this.amiiboService.postAmiibo(raw).then(() => this.load());
            }
            reader.readAsArrayBuffer(file);
        }
    }

    downloadAmiibo(amiibo: any) {
        this.amiiboService.getAmiibo(amiibo.id)
            .then(response => response.json())
            .then(amiibo => {
                let blob = new Blob([new Uint8Array(amiibo.raw)], { type: "octet/stream" })
                saveAs(blob, [amiibo.characterName, amiibo.name].join(' - ') + '.bin', true);
            })
    }

    deleteAmiibo(amiibo: any) {
        this.amiiboService.deleteAmiibo(amiibo.id)
            .then(() => this.load());
    }
}
