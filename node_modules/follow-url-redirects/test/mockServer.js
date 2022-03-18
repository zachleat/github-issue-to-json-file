const http = require('http');

class MockServer {
    constructor(port = 13376) {
        this.server = http.createServer(this._router);
        this.port = port;

        this.server.keepAliveTimeout = 1000;
		this.server.on('error', err => {
			console.log(err.stack);
		});
		this.server.on('connection', socket => {
			socket.setTimeout(1500);
		});
    }

    start(cb) {
        this.server.listen(this.port, cb);
    }

    stop(cb) {
        this.server.close(cb);
    }

    _router(req, res) {
        const path = req.url;

        if (path === '/hello') {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.end('world');
		}
		
		if (path === '/cookie') {
			res.statusCode = 200;
			res.setHeader('Set-Cookie', 'hello=world');
			res.end();
        }
        
        if (path === '/redirect/301') {
			res.statusCode = 301;
			res.setHeader('Location', '/hello');
			res.end();
		}

		if (path === '/redirect/302') {
			res.statusCode = 302;
			res.setHeader('Location', '/hello');
			res.end();
		}

		if (path === '/redirect/303') {
			res.statusCode = 303;
			res.setHeader('Location', '/hello');
			res.end();
		}

		if (path === '/redirect/307') {
			res.statusCode = 307;
			res.setHeader('Location', '/hello');
			res.end();
		}

		if (path === '/redirect/308') {
			res.statusCode = 308;
			res.setHeader('Location', '/hello');
			res.end();
		}

		if (path === '/redirect/chain') {
			res.statusCode = 301;
			res.setHeader('Location', '/redirect/301');
			res.end();
		}

		if (path === '/redirect/no-location') {
			res.statusCode = 301;
			res.end();
		}

		if (path === '/redirect/slow') {
			res.statusCode = 301;
			res.setHeader('Location', '/redirect/301');
			setTimeout(() => {
				res.end();
			}, 1000);
		}

		if (path === '/redirect/slow-chain') {
			res.statusCode = 301;
			res.setHeader('Location', '/redirect/slow');
			setTimeout(() => {
				res.end();
			}, 10);
		}
    }
}

module.exports = MockServer;

if (require.main === module) {
	const server = new MockServer(1337);
	server.start(() => {
		console.log(`Server started listening at port ${server.port}`);
	});
}