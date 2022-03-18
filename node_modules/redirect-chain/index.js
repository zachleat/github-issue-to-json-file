'use strict';

const Url = require('url');
const Http = require('http');
const Https = require('https');

const defaults = {
    maxRedirects: 50
};

module.exports = (options = {}) => {

    const config = getConfig();

    return {
        urls,
        domains,
        destination
    };

    async function urls (url) {

        if (!url) {
            throw new Error('Url must be defined');
        }
        if (typeof url !== 'string') {
            throw new Error('Url must be a string');
        }

        let _urls = [url];
        for (let i = 0; i < config.maxRedirects; i++) {
            const _url = _urls[i];
            const redirect = await getRedirect(_url);
            if (!redirect) {
                return _urls;
            }
            if (_urls.indexOf(redirect) !== -1) {
                throw new Error(`Redirect loop: ${url}`);
            }
            _urls.push(redirect);
        }
        return _urls;
    }
    async function domains (url) {

        return (await urls(url)).map((_url) => {
            return Url.parse(_url).host;
        }).filter((value, index, self) => self.indexOf(value) === index);
    }
    async function destination (url) {
        
        return (await urls(url)).pop();
    }

    async function getRedirect (url) {

        const requestOptions = Url.parse(url);
        const client = requestOptions.protocol === 'https:'
            ? Https
            : Http;
        requestOptions.method = 'HEAD';

        return new Promise((resolve, reject) => {

            const req = client.request(requestOptions, (res) => {

                if (!res.headers.location || res.statusCode >= 400) {
                    resolve(null);
                    return;
                }

                const redirect = Url.resolve(url, res.headers.location);
                resolve(redirect);
            });
            req.on('error', reject);
            req.end();
        })
    }

    function getConfig () {
        
        const config = {};

        if (options.maxRedirects) {
            if (typeof options.maxRedirects !== 'number') {
                throw new Error('options.maxRedirects must be a number');
            }
            config.maxRedirects = options.maxRedirects;
        }
        else {
            config.maxRedirects = defaults.maxRedirects;
        }
        
        return config;
    }
};
