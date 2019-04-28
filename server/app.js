const fs = require('fs');
const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');
const app = express()
const dbManager = require('./db');
const uuidv4 = require('uuid/v4')
const maboii = require('maboii');
const amiiboUtils = require('./amiibo/utils');
const db = dbManager.load();

const keys = maboii.loadMasterKeys([...fs.readFileSync('./keys.bin')]);

if (keys == null) {
    console.error('Failed to load keys.bin');
} else {
    //console.log(keys);
}

amiiboUtils.loadDatabase('./AmiiboAPI/database/amiibo.json');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post('/api/login', async (req, res) => {
    let user = db.getUser(req.body.login);
    if (user == null) {
        res.json(null);
        return;
    }
    let result = await bcrypt.compare(req.body.password, user.password);
    if (!result) {
        res.json(null);
        return;
    }

    let sessionId = uuidv4();
    let session = db.createSession(sessionId, user.login);

    res.json({ sessionId: session.sessionId });
})

app.post('/api/register', async (req, res) => {
    let user = await db.addUser(req.body.login, req.body.password);
    if (user == null) {
        res.json(null);
        return;
    }
    
    res.json({ result: 'ok' });
});

app.get('/api/bins', (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.json(null);
        return;
    }

    res.json(db.getBins(session.login));
});

app.get('/api/bins/:id', (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.json(null);
        return;
    }

    res.json(db.getBin(session.login, req.params.id));
});

app.delete('/api/bins/:id', (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.json(null);
        return;
    }

    res.json(db.deleteBin(session.login, req.params.id));
});

app.post('/api/bins', async (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.json(null);
        return;
    }

    let raw = req.body.raw;
    let result = undefined;
    try {
        let tmp = maboii.unpack(keys, raw);
        if (tmp.result) {
            result = tmp.unpacked;
        }
    } catch (exception) {
        console.error(exception);
    }
    
    if (result === undefined) {
        res.json({ result: false });
        return;
    }

    let characterId = maboii.plainDataUtils.getCharacterId(result);
    let characterName = amiiboUtils.getCharacterName(characterId);
    let gameSeriesId = maboii.plainDataUtils.getGameSeriesId(result);
    let gameSeriesName = amiiboUtils.getGameSeriesName(gameSeriesId);
    let amiiboId = maboii.plainDataUtils.getAmiiboId(result);
    let amiiboName = amiiboUtils.getAmiiboName(amiiboId);
    let name = maboii.plainDataUtils.getNickName(result);

    let bin = {
        raw,
        characterId,
        characterName,
        gameSeriesId,
        gameSeriesName,
        amiiboId,
        amiiboName,
        name,
    };
    res.json(bin);
    db.addBin(session.login, bin);
    console.log('Added', {
        characterId,
        characterName,
        gameSeriesId,
        gameSeriesName,
        amiiboId,
        amiiboName,
        name,
    })
});

app.use('/', express.static('../client/dist'));

app.listen(3000, function () {
    console.log('App listening on port 3000!')
})