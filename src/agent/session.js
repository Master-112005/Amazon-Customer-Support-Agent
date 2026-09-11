class SessionStore {
    constructor() {
        this.sessions = new Map();
    }

    getSession(userId) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, {
                activeIntent: null,
                pendingQuestion: null,
                state: 'IDLE',
                history: []
            });
        }
        return this.sessions.get(userId);
    }

    updateSession(userId, data) {
        const session = this.getSession(userId);
        this.sessions.set(userId, { ...session, ...data });
    }

    clearSession(userId) {
        this.sessions.delete(userId);
    }
}

module.exports = new SessionStore();
