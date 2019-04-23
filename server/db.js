(function() {
    const saltRounds = 10;
    const bcrypt = require('bcryptjs');
    const uuidv4 = require('uuid/v4')
    exports.load = function() {
        return new Database()
    }

    class Database {
        constructor() {
            this.db = {
                users: {},
                sessions: {},
                bins: {}
            };
        }
        getUser(login) {
            return this.db.users[login];
        }
        async addUser(login, password) {
            let hash = await bcrypt.hash(password, saltRounds);
            if (this.db.users[login]) {
                return null;
            }
            let newUser = {
                login,
                password: hash
            };
            this.db.users[login] = newUser;
            return newUser;
        }

        getSession(sessionId) {
            let currentDate = new Date().getTime() - 1000 * 60 * 60 * 5;
            for (let sessionId in this.db.sessions) {
                let sessionDate = this.db.sessions[sessionId].date.getTime();
                if (sessionDate < currentDate) {
                    delete this.db.sessions[sessionId];
                }
            }
            return this.db.sessions[sessionId];
        }

        createSession(sessionId, login) {
            let session = this.db.sessions[sessionId] = {
                sessionId,
                login,
                date: new Date()
            };
            return session;
        }

        getBins(login) {
            return (this.db.bins[login] || []).map(bin => { return {
                uid: bin.uid,
                owner: bin.owner,
                name: bin.name,
                characterId: bin.characterId,
                characterName: bin.characterName,
                gameSeriesId: bin.gameSeriesId,
                gameSeriesName: bin.gameSeriesName,
                amiiboId: bin.amiiboId,
                amiiboName: bin.amiiboName,
                id: bin.id,
            }}) || [];
        }

        getBin(login, id) {
            return Object.assign({}, this.db.bins[login].find(bin => bin.id === id));
        }

        deleteBin(login, id) {
            let originalBin = this.db.bins[login].find(bin => bin.id === id)
            if(originalBin) {
                let bin = Object.assign({}, originalBin);
                let index = this.db.bins[login].indexOf(originalBin);
                this.db.bins[login].splice(index, 1);
                return bin;
            }
            return null;
        }

        addBin(login, amiiboData) {
            let bin = {
                raw: amiiboData.raw,
                uid: amiiboData.uid,
                owner: amiiboData.owner,
                name: amiiboData.name,
                characterId: amiiboData.characterId,
                characterName: amiiboData.characterName,
                gameSeriesId: amiiboData.gameSeriesId,
                gameSeriesName: amiiboData.gameSeriesName,
                amiiboId: amiiboData.amiiboId,
                amiiboName: amiiboData.amiiboName,
                id: uuidv4(),
            }
            this.db.bins[login] = this.db.bins[login] || [];
            this.db.bins[login].push(bin);
            return bin;
        }
    }
})();
