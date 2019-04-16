const fs = require('fs');

exports.load = function(file) {
    if (!fs.existsSync(file)) {
        return null;
    }
    let buf = fs.readFileSync(file)
    let keys = {
        data: readMasterKey(buf, 0),
        tag: readMasterKey(buf, 80)
    }

    if (keys.data.magicBytesSize > 16 ||
        keys.tag.magicBytesSize > 16) {
            return null;
        }
    
    return new MasterKey(keys.data, keys.tag);
}

class MasterKey {
    constructor(data, tag) {
        this.data = data;
        this.tag = tag;
    }
}

/**
 * @param {Buffer} buf 
 * @param {number} offset 
 */
function readMasterKey(buf, offset) {
    let hmacKey = [];
    let typeString = [];
    let rfu;
    let magicBytesSize;
    let magicBytes = [];
    let xorPad = [];

    for (let i = 0; i < 16; i++)
        hmacKey[i] = buf.readUInt8(offset + i);
    for (let i = 0; i < 14; i++)
        typeString[i] = buf.readInt8(offset + i + 16);
    rfu = buf.readUInt8(offset + 16 + 14);
    magicBytesSize = buf.readUInt8(offset + 16 + 14 + 1);
    for (let i = 0; i < 16; i++)
        magicBytes[i] = buf.readUInt8(offset + i + 16 + 14 + 1 + 1);
    for (let i = 0; i < 32; i++)
        xorPad[i] = buf.readUInt8(offset + i + 16 + 14 + 1 + 1 + 16);

    return {
        hmacKey,
        typeString,
        rfu,
        magicBytesSize,
        magicBytes,
        xorPad,
    }
}