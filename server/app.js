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

app.delete('/api/logout', async (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.status(401);
        res.json(null);
        return;
    }
    session = db.deleteSession(session.sessionId)

    if (session) {
        res.json({ sessionId: session.sessionId });
    }
    res.status(404);
    res.json(null);
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
        res.status(401);
        res.json(null);
        return;
    }

    let bins = db.getBins(session.login)
    bins.forEach((bin) => {
        if (bin) {
            let { characterName, gameSeriesName, amiiboName } = getDataFromAmiibo(bin)
            bin.characterName = characterName
            bin.gameSeriesName = gameSeriesName
            bin.amiiboName = amiiboName
        }
    })

    res.json(bins);
});

app.get('/api/bins/:id', (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.status(401);
        res.json(null);
        return;
    }

    let amiibo = db.getBin(session.login, req.params.id)
    if (amiibo) {
        let { characterName, gameSeriesName, amiiboName } = getDataFromAmiibo(amiibo)
        amiibo.characterName = characterName
        amiibo.gameSeriesName = gameSeriesName
        amiibo.amiiboName = amiiboName
    }

    res.json(amiibo);
});

/**
 * 
 * @param {{ characterId: string, gameSeriesId: string, amiiboId: string }} amiiboData 
 */
function getDataFromAmiibo (amiiboData) {
    return {
        characterName: amiiboUtils.getCharacterName(amiiboData.characterId),
        gameSeriesName: amiiboUtils.getGameSeriesName(amiiboData.gameSeriesId),
        amiiboName: amiiboUtils.getAmiiboName(amiiboData.amiiboId)
    }
}

app.delete('/api/bins/:id', (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.status(401);
        res.json(null);
        return;
    }

    res.json(db.deleteBin(session.login, req.params.id));
});

app.patch('/api/bins/:id', async (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.status(401);
        res.json(null);
        return;
    }

    if (!Array.isArray(req.body.uid) || (req.body.uid.length !== 7)) {
        res.status(400)
            .json({ message: 'INVALID_UID' })
        return
    }
    for (let i = 0; i < req.body.uid.length; i++) {
        if (typeof req.body.uid[i] !== 'number') {
            res.status(400)
                .json({ message: 'INVALID_UID' })
            return
        }
    }

    let amiiboData = db.getBin(session.login, req.params.id)
    let patchedAmiibo = patchAmiibo(amiiboData.raw, req.body.uid)
    res.json({ data: patchedAmiibo })
})

app.post('/api/bins', async (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.status(401);
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
    let gameSeriesId = maboii.plainDataUtils.getGameSeriesId(result);
    let amiiboId = maboii.plainDataUtils.getAmiiboId(result);
    let name = maboii.plainDataUtils.getNickName(result);

    let bin = {
        raw,
        characterId,
        gameSeriesId,
        amiiboId,
        name,
    };
    res.json(bin);
    db.addBin(session.login, bin);
    console.log('Added', {
        characterId,
        gameSeriesId,
        amiiboId,
        name,
    })
});

app.use('/', express.static('../client/dist'));

app.listen(3000, function () {
    console.log('App listening on port 3000!')
})

function patchAmiibo(amiiboData, uid) {
    let tmp = maboii.unpack(keys, amiiboData);
    if (!tmp.result) {
        throw new Error('UNABLE_TO_UNPACK_DATA')
    }
    let result = tmp.unpacked;

    let longUid = null
    if (uid.length === 9) {
        longUid = uid
    } else if (uid.length === 7) {
        let BCC0 = 0x88 ^ uid[0] ^ uid[1] ^ uid[2]
        let BCC1 = uid[3] ^ uid[4] ^ uid[5] ^ uid[6]
        longUid = [ uid[0], uid[1], uid[2], BCC0, uid[3], uid[4], uid[5], uid[6], BCC1 ]
    } else {
        throw new Error('INVALID_UID')
    }
    let password = generatePasswordFromUid(longUid)

    result[0] = longUid[8]
    result[2] = result[3] = 0
    for (let i = 0; i < 8; i++)
        result[0x1D4 + i] = longUid[i]
    result[0x208] = result[0x209] = result[0x20A] = 0
    for (let i = 0; i < 4; i++)
        result[0x214 + i] = password[i]
    result[0x218] = result[0x219] = 0x80

    console.log(longUid, password, result)

    return maboii.pack(keys, result)
}

function generatePasswordFromUid(uid) {
    return [
        0xAA ^ uid[1] ^ uid[4],
        0x55 ^ uid[2] ^ uid[5],
        0xAA ^ uid[4] ^ uid[6],
        0x55 ^ uid[5] ^ uid[7]
    ]
}