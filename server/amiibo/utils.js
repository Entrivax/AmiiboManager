exports.getAmiiboId =
/**
 * 
 * @param {number[]} decodedData 
 */
function(decodedData) {
    return decodedData.slice(0x1DC, 0x1E3 + 1).map((a) => a.toString(16).padStart(2, '0')).join('');
}

exports.getCharacterId =
/**
 * 
 * @param {number[]} decodedData 
 */
function(decodedData) {
    return decodedData.slice(0x1DC, 0x1DD + 1).map((a) => a.toString(16).padStart(2, '0')).join('');
}

exports.getGameSeriesId =
/**
 * 
 * @param {number[]} decodedData 
 */
function(decodedData) {
    return decodedData.slice(0x1DC, 0x1DD + 1).map((a) => a.toString(16).padStart(2, '0')).join('').substr(0, 3);
}

exports.getNickName =
/**
 * 
 * @param {number[]} decodedData 
 */
function(decodedData) {
    let nameBuffer = decodedData.slice(0x38, 0x4B + 1);
    for(let i = 0; i < nameBuffer.length; i += 2) {
        let tmp = nameBuffer[i];
        nameBuffer[i] = nameBuffer[i + 1];
        nameBuffer[i + 1] = tmp;
    }
    return decodeUtf16(new Uint16Array(new Uint8Array(nameBuffer).buffer));
}

let fs = require('fs');
let db;

exports.loadDatabase = function(file) {
    let content = fs.readFileSync(file);
    let tmpDb = JSON.parse(content.toString());
    db = tmpDb;
}

exports.getCharacterName = function(characterId) {
    if (db === undefined) {
        throw new Error('Amiibo database not loaded');
    }
    let characterName = db.characters['0x' + characterId];
    return characterName || 'Unknown';
}

exports.getAmiiboName = function(amiiboId) {
    if (db === undefined) {
        throw new Error('Amiibo database not loaded');
    }
    let amiibo = db.amiibos['0x' + amiiboId];
    return (amiibo ? amiibo.name : 'Unknown') || 'Unknown';
}

exports.getGameSeriesName = function(gameSeriesId) {
    if (db === undefined) {
        throw new Error('Amiibo database not loaded');
    }
    let gameSeriesName = db.game_series['0x' + gameSeriesId];
    return gameSeriesName || 'Unknown';
}


//https://gist.github.com/also/912792
function decodeUtf16(w) {
    var i = 0;
    var len = w.length;
    var w1, w2;
    var charCodes = [];
    while (i < len) {
        var w1 = w[i++];
        if (w1 === 0x0)
            break;
        if ((w1 & 0xF800) !== 0xD800) { // w1 < 0xD800 || w1 > 0xDFFF
            charCodes.push(w1);
            continue;
        }
        if ((w1 & 0xFC00) === 0xD800) { // w1 >= 0xD800 && w1 <= 0xDBFF
            throw new RangeError('Invalid octet 0x' + w1.toString(16) + ' at offset ' + (i - 1));
        }
        if (i === len) {
            throw new RangeError('Expected additional octet');
        }
        w2 = w[i++];
        if ((w2 & 0xFC00) !== 0xDC00) { // w2 < 0xDC00 || w2 > 0xDFFF)
            throw new RangeError('Invalid octet 0x' + w2.toString(16) + ' at offset ' + (i - 1));
        }
        charCodes.push(((w1 & 0x3ff) << 10) + (w2 & 0x3ff) + 0x10000);
    }
    return String.fromCharCode.apply(String, charCodes);
}