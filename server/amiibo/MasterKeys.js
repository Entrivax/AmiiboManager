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
        return new Proxy(this, this);
    }

    get(target, prop) {
        if (prop === 'aesKey') {
            return target.aesKey;
        } else if (prop === 'aesIV') {
            return target.aesIV;
        } else if (prop === 'hmacKey') {
            return target.hmacKey;
        } else if (prop === 'getUnified') {
            return target.getUnified;
        }
        return target.getByte(prop);
    }

    set(target, prop, value) {
        target.setByte(+prop, value);
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

    getUnified() {
        return this.aesKey.concat(this.aesIV, this.hmacKey);
    }
}
exports.DerivedKeys = DerivedKeys;