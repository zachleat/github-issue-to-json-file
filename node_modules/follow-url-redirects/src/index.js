const http = require('http');
const https = require('https')
const qs = require('query-string')
const RedirectLimitError = require('./errors/RedirectLimitError');
const helpers = require('./helpers');

/**
 * Follows all 300x errors
 * @param {string} url 
 * @param {object} opts 
 */
function followRedirects(url, opts = {}) {
    if (!url || url.trim() === '' || !url.startsWith('http')) {
        return Promise.reject(new Error('Please enter a http or https url'));
    }

    opts = Object.assign({
        timeout: 10 * 1000,
        maxRedirects: 10
    }, opts);

    const isRedirect = code => [301, 302, 303, 307, 308].includes(code);

    return new Promise((resolve, reject) => {
        const redirectChain = [];
        let requestCounter = 0;
        function goToUrl(urlToGo) {
            try {
                urlToGo = new URL(urlToGo);
            } catch (error) {
                reject(new Error(`Invalid url: ${urlToGo}`));
                return;
            }

            const send = (urlToGo.protocol === 'https:' ? https : http).request;

            const requestData = {
                hostname: urlToGo.hostname,
                path: urlToGo.pathname,
                timeout: opts.timeout
            };

            if (urlToGo.port) {
                requestData.port = urlToGo.port;
            }

            const request = send(requestData);

            request.on('error', (err) => {
                request.abort();
                reject(new Error(`request to ${urlToGo} failed, reason: ${err.message}`));
            });

            request.on('response', (res) => {
                let { location } = res.headers;
                const queryParamsObj = qs.parse(new URL(urlToGo.toString()).search)
                redirectChain.push({
                    url: urlToGo.toString(),
                    code: res.statusCode,
                    cookies: res.headers['set-cookie'] ? helpers.parseCookieHeader(res.headers['set-cookie']) : {},
                    queryParams: queryParamsObj
                });

                if (location && isRedirect(res.statusCode)) {

                    if (requestCounter >= opts.maxRedirects) {
                        reject(new RedirectLimitError('Redirect limit reached', redirectChain));
                        return;
                    }

                    if (location.startsWith('/')) {
                        urlToGo.pathname = location;
                        location = urlToGo;
                    }

                    requestCounter++;
                    goToUrl(location);
                } else {
                    resolve(redirectChain);
                }
            })
            request.end();
        }

        goToUrl(url);
    });
}

module.exports = followRedirects;