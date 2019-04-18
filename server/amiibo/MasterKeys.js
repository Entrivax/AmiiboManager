class MasterKeys {
    constructor(data, tag) {
        this.data = data;
        this.tag = tag;
    }
}
exports.MasterKeys = MasterKeys;

class DerivedKeys {
    constructor() {
        this.aesKey = [];
        this.aesIV = [];
        this.hmacKey = [];
    }

    getByte(i) {
        if (i < 16) {
            return this.aesKey[i];
        } else if (i < 32) {
            return this.aesIV[i - 16];
        } else {
            return this.hmacKey[i - 32];
        }
    }

    setByte(i, val) {
        if (i < 16) {
            this.aesKey[i] = val;
            return;
        } else if (i < 32) {
            this.aesIV[i - 16] = val;
            return;
        } else {
            this.hmacKey[i - 32] = val;
            return;
        }
    }
}
exports.DerivedKeys = DerivedKeys;