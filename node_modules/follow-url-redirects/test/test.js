const expect = require('chai').expect;
const mockServer = require('./mockServer');

const followRedirects = require('../src/index');

const port = 13371
const server = new mockServer(port);

const baseUrl = `http://localhost:${port}/`;

before((done) => {
    server.start(done);
});

after((done) => {
    server.stop(done);
});

describe('follow-url-redirects', () => {
    it('Should reject with an error when no url is given', async () => {
        try {
            await followRedirects('');
        } catch(error) {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.be.equal('Please enter a http or https url');
        }
    });

    it('Should reject with an error when a invalid url is given', async () => {
        try {
            await followRedirects('localhost');
        } catch(error) {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.be.equal('Please enter a http or https url');
        }

        try {
            await followRedirects('ftp://localhost');
        } catch(error) {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.be.equal('Please enter a http or https url');
        }
    });

    it('Returns array with objects with baseurl and status code (link status code 200)', async () => {
        const url = `${baseUrl}hello`;
        const expected = [
            {
                url: url,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow to the correct url and returns the correct object with a 301 redirect also a location url starting with / should work', async ()  => {
        const url = `${baseUrl}redirect/301`;
        const expected = [
            {
                url: url,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow to the correct url and returns the correct object with a 302 redirect', async ()  => {
        const url = `${baseUrl}redirect/302`;
        const expected = [
            {
                url: url,
                code: 302,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow to the correct url and returns the correct object with a 303 redirect', async ()  => {
        const url = `${baseUrl}redirect/303`;
        const expected = [
            {
                url: url,
                code: 303,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow to the correct url and returns the correct object with a 307 redirect', async ()  => {
        const url = `${baseUrl}redirect/307`;
        const expected = [
            {
                url: url,
                code: 307,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow to the correct url and returns the correct object with a 308 redirect', async ()  => {
        const url = `${baseUrl}redirect/308`;
        const expected = [
            {
                url: url,
                code: 308,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should chain redirects and return the correct opbject', async ()  => {
        const url = `${baseUrl}redirect/chain`;
        const expected = [
            {
                url: url,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}redirect/301`,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow redirects on slower (server-side) connection and return correct object', async ()  => {
        const url = `${baseUrl}redirect/slow`;
        const expected = [
            {
                url: url,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}redirect/301`,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should follow a chain of slower redirects and return correct object', async ()  => {
        const url = `${baseUrl}redirect/slow-chain`;
        const expected = [
            {
                url: url,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}redirect/slow`,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}redirect/301`,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}hello`,
                code: 200,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should return only the redirect location when there is no location header set', async () => {
        const url = `${baseUrl}redirect/no-location`;
        const expected = [
            {
                url: url,
                code: 301,
                cookies: {},
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Should throw a error when max redirect limit is reached', async () => {
        const url = `${baseUrl}redirect/slow`;
        const options = {
            maxRedirects: 1
        };

        try {
            await followRedirects(url, options);
        } catch(error) {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.be.equal('Redirect limit reached');
        }
    });

    it('Should throw a error with the current redirect chain when limit is reached', async () => {
        const url = `${baseUrl}redirect/slow`;
        const options = {
            maxRedirects: 1
        };
        const redirects = [
            {
                url,
                code: 301,
                cookies: {},
                queryParams: {}
            },
            {
                url: `${baseUrl}redirect/301`,
                code: 301,
                cookies: {},
                queryParams: {}
            }
        ];

        try {
            await followRedirects(url, options);
        } catch(error) {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.be.equal('Redirect limit reached');
            expect(error.redirects).to.be.eql(redirects);
        }
    });

    it('Returns the cookies of a request', async () => {
        const url = `${baseUrl}cookie`;
        const expected = [
            {
                url: url,
                code: 200,
                cookies:
                {
                    hello: 'world'
                },
                queryParams: {}
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });

    it('Returns the cookies and query params of a request', async () => {
        const url = `${baseUrl}cookie?hello=world&test=1`;
        const expected = [
            {
                url: url,
                code: 200,
                cookies:
                {
                    hello: 'world'
                },
                queryParams: {
                    hello: 'world',
                    test: '1'
                }
            }
        ];

        expect((await followRedirects(url))).to.be.eql(expected);
    });
});