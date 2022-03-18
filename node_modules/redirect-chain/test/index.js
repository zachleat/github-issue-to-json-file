const { expect } = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const StartTestServer = require('./start-test-server');

lab.before(async () => await StartTestServer());

lab.test('returns urls chain', async () => {

    const redirectChain = require('../index')();
    const urlsChain = await redirectChain.urls('http://localhost:3000/1');
    expect(urlsChain[0]).to.equal('http://localhost:3000/1');
    expect(urlsChain[1]).to.equal('http://localhost:3000/2');
    expect(urlsChain[2]).to.equal('http://localhost:3000/3');
    expect(urlsChain[3]).to.equal('http://localhost:3000/4');
    expect(urlsChain[4]).to.equal('https://google.com/');
    expect(urlsChain[5]).to.equal('https://www.google.com/');
});

lab.test('returns domains chain', async () => {

    const redirectChain = require('../index')();
    const domainsChain = await redirectChain.domains('http://localhost:3000/1');
    expect(domainsChain[0]).to.equal('localhost:3000');
    expect(domainsChain[1]).to.equal('google.com');
    expect(domainsChain[2]).to.equal('www.google.com');
});

lab.test('returns destination', async () => {

    const redirectChain = require('../index')();
    const destination = await redirectChain.destination('http://localhost:3000/1');
    expect(destination).to.equal('https://www.google.com/');
});

lab.test('throws on redirect loop', async () => {

    const redirectChain = require('../index')();

    // urls
    let exception1;
    try {
        await redirectChain.urls('http://localhost:3000/loop1');
    }
    catch (err) {
        exception1 = err;
    }
    expect(exception1).to.an.error();
    
    // domains
    let exception2;
    try {
        await redirectChain.domains('http://localhost:3000/loop1');
    }
    catch (err) {
        exception2 = err;
    }
    expect(exception2).to.an.error();

    // destination
    let exception3;
    try {
        await redirectChain.destination('http://localhost:3000/loop1');
    }
    catch (err) {
        exception3 = err;
    }
    expect(exception3).to.an.error();
});

lab.test('custom redirect limit', async () => {
    const numRedirects = 2;
    const redirectChain = require('../index')({
        maxRedirects: numRedirects
    });

    // urls
    const urls = await redirectChain.urls('http://localhost:3000/1');
    expect(urls.length).to.equal(numRedirects + 1);

    // domains
    const domains = await redirectChain.domains('http://localhost:3000/1');
    expect(domains.length).to.equal(1);

    // destination
    const destination = await redirectChain.destination('http://localhost:3000/1');
    expect(destination).to.equal('http://localhost:3000/3');
});

lab.test('no input url', async () => {
    const redirectChain = require('../index')();

    // urls
    let exception1;
    try {
        await redirectChain.urls();
    }
    catch (err) {
        exception1 = err;
    }
    expect(exception1).to.an.error();
    
    // domains
    let exception2;
    try {
        await redirectChain.domains();
    }
    catch (err) {
        exception2 = err;
    }
    expect(exception2).to.an.error();

    // destination
    let exception3;
    try {
        await redirectChain.destination();
    }
    catch (err) {
        exception3 = err;
    }
    expect(exception3).to.an.error();
});

lab.test('input url not a string', async () => {
    const redirectChain = require('../index')();

    // urls
    let exception1;
    try {
        await redirectChain.urls(1);
    }
    catch (err) {
        exception1 = err;
    }
    expect(exception1).to.an.error();
    
    // domains
    let exception2;
    try {
        await redirectChain.domains(2);
    }
    catch (err) {
        exception2 = err;
    }
    expect(exception2).to.an.error();

    // destination
    let exception3;
    try {
        await redirectChain.destination(3);
    }
    catch (err) {
        exception3 = err;
    }
    expect(exception3).to.an.error();
});

lab.test('options.maxRedirects must be a number', async () => {

    // urls
    let exception;
    try {
        require('../index')({ maxRedirects: '1' });
    }
    catch (err) {
        exception = err;
    }
    expect(exception).to.an.error();
});

lab.test('http error handling', async () => {
    const redirectChain = require('../index')();

    // urls
    const urls = await redirectChain.urls('http://localhost:3000/error1');
    expect(urls[0]).to.equal('http://localhost:3000/error1');

    // domains
    const domains = await redirectChain.domains('http://localhost:3000/error1');
    expect(domains[0]).to.equal('localhost:3000');

    // destination
    const destination = await redirectChain.destination('http://localhost:3000/error1');
    expect(destination).to.equal('http://localhost:3000/error1');
});


