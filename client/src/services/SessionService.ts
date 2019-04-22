export class SessionService {
    setSession(sessionId: string) {
        window.localStorage.setItem('session', sessionId);
    }

    getSession() {
        return window.localStorage.getItem('session');
    }
}
