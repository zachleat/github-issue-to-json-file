const cookie = require('cookie');

function parseCookieHeader (header) {
    return (Array.isArray(header) ? header : header.split(',')).map(
        xs => cookie.parse(xs)
    ).reduce((lhs, rhs) => Object.assign(lhs, rhs), {});
}

module.exports = {
    parseCookieHeader
}