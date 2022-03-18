class RedirectLimitError extends Error {
    constructor(message, redirects = []) {
        super(message);
        this.name = 'RedirectLimitError';
        this.redirects = redirects;
    }
}

module.exports = RedirectLimitError;