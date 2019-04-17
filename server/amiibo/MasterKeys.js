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
}
exports.DerivedKeys = DerivedKeys;