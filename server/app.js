const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const app = express()
const dbManager = require('./db');
const uuidv4 = require('uuid/v4')
const amiiboKey = require('./amiibo/key');
const db = dbManager.load();

const keys = amiiboKey.load('./keys.bin');

if (keys == null) {
    console.error('Failed to load keys.bin');
} else {
    console.log(keys);
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/api/login', async (req, res) => {
    let user = db.getUser(req.body.login);
    if (user == null) {
        res.json(null);
        return;
    }
    let result = await bcrypt.compare(req.password, user.password);
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

app.post('/api/bins', async (req, res) => {
    let session = db.getSession(req.headers.authorization);
    if (!session) {
        res.json(null);
        return;
    }

    let raw = req.body.raw;
    let bin = {
        raw
    };
    db.addBin(session.login, bin);
});

app.listen(3000, function () {
    console.log('App listening on port 3000!')
})