const { MasterKeys, DerivedKeys } = require("./MasterKeys");

exports.unpack = unpack;

/**
 * 
 * @param {MasterKeys} amiiboKeys 
 * @param {*} tag 
 */
function unpack(amiiboKeys, tag) {
    let unpacked = [];
    let result = false;
    let internal = [];
    let dataKeys = new DerivedKeys();
    let tagKeys = new DerivedKeys();

    tagToInternal(tag, internal);

    amiiboKeygen(amiiboKeys.data, internal, dataKeys);
    amiiboKeygen(amiiboKeys.tag, internal, tagKeys);

    return {
        unpacked,
        result
    }
}


function memcpy(destination, destinationOffset, source, sourceOffset, length) {
    for (let i = 0; i < length; i++) {
        destination[destinationOffset + i] = source[sourceOffset + i];
    }
}

function memset(destination, destinationOffset, data, length) {
    for (let i = 0; i < length; i++) {
        destination[destinationOffset + i] = data;
    }
}

function amiiboKeygen(masterKey, internalDump, derivedKeys) {
    let seed = [];

    amiiboCalcSeed(internalDump, seed);
    keygen(masterKey, seed, derivedKeys);
}

function amiiboCalcSeed(internaldump, seed) {
    memcpy(seed, 0x00, internaldump, 0x029, 0x02);
	memset(seed, 0x02, 0x00, 0x0E);
	memcpy(seed, 0x10, internaldump, 0x1D4, 0x08);
	memcpy(seed, 0x18, internaldump, 0x1D4, 0x08);
	memcpy(seed, 0x20, internaldump, 0x1E8, 0x20);
}

function tagToInternal(tag, internal) {
	memcpy(internal, 0x000, tag, 0x008, 0x008);
	memcpy(internal, 0x008, tag, 0x080, 0x020);
	memcpy(internal, 0x028, tag, 0x010, 0x024);
	memcpy(internal, 0x04C, tag, 0x0A0, 0x168);
	memcpy(internal, 0x1B4, tag, 0x034, 0x020);
	memcpy(internal, 0x1D4, tag, 0x000, 0x008);
	memcpy(internal, 0x1DC, tag, 0x054, 0x02C);
}

function internalToTag(internal, tag) {
	memcpy(tag, 0x008, internal, 0x000, 0x008);
	memcpy(tag, 0x080, internal, 0x008, 0x020);
	memcpy(tag, 0x010, internal, 0x028, 0x024);
	memcpy(tag, 0x0A0, internal, 0x04C, 0x168);
	memcpy(tag, 0x034, internal, 0x1B4, 0x020);
	memcpy(tag, 0x000, internal, 0x1D4, 0x008);
	memcpy(tag, 0x054, internal, 0x1DC, 0x02C);
}