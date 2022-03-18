'use strict';

const Hapi = require('hapi');

const StartTestServer = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });
    server.route([
        {
            method: 'GET',
            path: '/1',
            handler: (_r, h) => h.redirect('/2')
        },
        {
            method: 'GET',
            path: '/2',
            handler: (_r, h) => h.redirect('/3')
        },
        {
            method: 'GET',
            path: '/3',
            handler: (_r, h) => h.redirect('/4')
        },
        {
            method: 'GET',
            path: '/4',
            handler: (_r, h) => h.redirect('https://google.com/')
        },
        {
            method: 'GET',
            path: '/loop1',
            handler: (_r, h) => h.redirect('/loop2')
        },
        {
            method: 'GET',
            path: '/loop2',
            handler: (_r, h) => h.redirect('/loop1')
        },
        {
            method: 'GET',
            path: '/error1',
            handler: (_r, h) => h.redirect('/error2').code(401)
        }
    ]);
    await server.start();
};

process.on('unhandledRejection', (err) => {
    console.log(err);
});

module.exports = StartTestServer;