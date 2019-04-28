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
