(function() {
    const saltRounds = 10;
    const bcrypt = require('bcrypt');
    const uuidv4 = require('uuid/v4')
    exports.load = function() {
        return new Database()
    }

    class Database {
        db;
        
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
            return this.db.bins[login] || [];
        }

        addBin(login, amiiboData) {
            let bin = {
                raw: amiiboData.raw,
                uid: amiiboData.uid,
                owner: amiiboData.owner,
                name: amiiboData.name,
                characterId: amiiboData.characterId,
                gameSeriesId: amiiboData.gameSeriesId,
                id: uuidv4(),
            }
            this.db.bins[login] = this.db.bins[login] || [];
            this.db.bins[login].push(bin);
            return bin;
        }
    }
})();
