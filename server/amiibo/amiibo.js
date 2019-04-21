const { MasterKeys, DerivedKeys } = require("./MasterKeys");
const crypto = require('crypto');
const HMAC_POS_DATA = 0x008
const HMAC_POS_TAG = 0x1B4
exports.unpack = unpack;

/**
 * 
 * @param {MasterKeys} amiiboKeys 
 * @param {*} tag 
 */
function unpack(amiiboKeys, tag) {
    let unpacked = new Array(520).fill(0);
    let result = false;
    let internal = new Array(520).fill(0);
    let dataKeys = new DerivedKeys();
    let tagKeys = new DerivedKeys();

    // Convert format
    tagToInternal(tag, internal);

    // Generate keys
    amiiboKeygen(amiiboKeys.data, internal, dataKeys);
    amiiboKeygen(amiiboKeys.tag, internal, tagKeys);

    // Decrypt
    amiiboCipher(dataKeys, internal, unpacked);

    // Regenerate tag HMAC. Note: order matters, data HMAC depends on tag HMAC!
    computeHmac(tagKeys.hmacKey, unpacked, 0x1D4, 0x34, unpacked, HMAC_POS_TAG);

    // Regenerate data HMAC
    computeHmac(dataKeys.hmacKey, unpacked, 0x029, 0x1DF, unpacked, HMAC_POS_DATA);

    result = memcmp(unpacked, HMAC_POS_DATA, internal, HMAC_POS_DATA, 32) == 0 &&
        memcmp(unpacked, HMAC_POS_TAG, internal, HMAC_POS_TAG, 32) == 0;

    return {
        unpacked,
        result,
    }
}

function memcmp(s1, s1Offset, s2, s2Offset, size) {
    for (let i = 0; i < size; i++) {
        if (s1[s1Offset + i] !== s2[s2Offset + i]) {
            return s1[s1Offset + i] - s2[s2Offset + i];
        }
    }
    return 0;
}

function memcpy(destination, destinationOffset, source, sourceOffset, length) {
    for (let i = 0; i < length; i++) {
        destination[destinationOffset + i] = source[sourceOffset + i];
    }
}

function memccpy(destination, destinationOffset, source, sourceOffset, character, length) {
    for (let i = 0; i < length; i++) {
        destination[destinationOffset + i] = source[sourceOffset + i];
        if (source[sourceOffset + i] == character) {
            return destinationOffset + i + 1;
        }
    }
    return null;
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

function keygen(baseKey, baseSeed, derivedKeys) {
    let preparedSeed = [];
    keygenPrepareSeed(baseKey, baseSeed, preparedSeed);
    drbgGenerateBytes(baseKey.hmacKey, preparedSeed, derivedKeys);
}

function keygenPrepareSeed(baseKey, baseSeed, output) {
    // 1: Copy whole type string
    let outputOffset = memccpy(output, 0, baseKey.typeString, 0, 0, 14);

    // 2: Append (16 - magicBytesSize) from the input seed
    let leadingSeedBytes = 16 - baseKey.magicBytesSize;
    memcpy(output, outputOffset, baseSeed, 0, leadingSeedBytes);
    outputOffset += leadingSeedBytes;

    // 3: Append all bytes from magicBytes
    memcpy(output, outputOffset, baseKey.magicBytes, 0, baseKey.magicBytesSize);
    outputOffset += baseKey.magicBytesSize;

    // 4: Append bytes 0x10-0x1F from input seed
    memcpy(output, outputOffset, baseSeed, 0x10, 16);
    outputOffset += 16;

    // 5: Xor last bytes 0x20-0x3F of input seed with AES XOR pad and append them
    for (let i = 0; i < 32; i++) {
        output[outputOffset + i] = baseSeed[i + 32] ^ baseKey.xorPad[i];
    }
    outputOffset += 32;

    return outputOffset;
}

/**
 * 
 * @param {*} hmacKey 
 * @param {*} seed 
 * @param {DerivedKeys} output 
 */
function drbgGenerateBytes(hmacKey, seed, output) {
    const DRBG_OUTPUT_SIZE = 32;
    let outputSize = 48;
    let outputOffset = 0;
    let temp = [];

    let iterationCtx = { iteration: 0 };
    while (outputSize > 0) {
        if (outputSize < DRBG_OUTPUT_SIZE) {
            drbgStep(initHmac(hmacKey, iterationCtx.iteration, seed), temp, 0, iterationCtx);
            memcpy(output, outputOffset, temp, 0, outputSize);
            break;
        }

        drbgStep(initHmac(hmacKey, iterationCtx.iteration, seed), output, outputOffset, iterationCtx);
        outputOffset += DRBG_OUTPUT_SIZE;
        outputSize -= DRBG_OUTPUT_SIZE;
    }
}

function initHmac(hmacKey, iteration, seed) {
    let hmac = crypto.createHmac('sha256', new Uint8Array(hmacKey));
    hmac.update(new Uint8Array([(iteration >> 8) & 0x0f, (iteration >> 0) & 0x0f].concat(seed)));
    return hmac;
}

/**
 * @param {crypto.Hmac} hmac 
 * @param {*} output 
 * @param {*} outputOffset 
 */
function drbgStep(hmac, output, outputOffset, iterationCtx) {
    iterationCtx.iteration++;
    let buf = hmac.digest('binary');
    memcpy(output, outputOffset, Array.from(buf).map((a) => '' + a.charCodeAt(0)), 0, buf.length);
}

/**
 * 
 * @param {DerivedKeys} keys 
 * @param {any[]} input 
 * @param {any[]} output 
 */
function amiiboCipher(keys, input, output) {
    let cipher = crypto.createDecipheriv('aes-128-ctr', new Uint8Array(keys.aesKey), new Uint8Array(keys.aesIV));
    let buf = cipher.update(new Uint8Array(input).subarray(0x02C, 0x02C + 0x188));

    memcpy(output, 0x02C, buf, 0, 0x188);

    memcpy(output, 0, input, 0, 0x008);
    memcpy(output, 0x028, input, 0x028, 0x004);
    memcpy(output, 0x1D4, input, 0x1D4, 0x034);
}

function computeHmac(hmacKey, input, inputOffset, inputLength, output, outputOffset) {
    let hmac = crypto.createHmac('sha256', new Uint8Array(hmacKey));
    let result = hmac.update(new Uint8Array(input).subarray(inputOffset, inputOffset + inputLength)).digest();
    memcpy(output, outputOffset, result, 0, result.length);
}