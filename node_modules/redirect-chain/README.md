# redirect-chain

## Description
Strict and robust way to get the redirect chain for a given url, async based. No dependencies. Fully tested with 100% code coverage. Throws on redirect loop.

## Usage
```javascript
// initialization
const config = {
    maxRedirects: 50 // default value
}
const redirectChain = require('redirect-chain')(config);

// get urls redirect chain for an url
const urlsChain = await redirectChain.urls('http://google.com');
// [ 'http://google.com', 'http://www.google.com/' ]

// get domains redirect chain for an url
const domainsChain = await redirectChain.domains('http://google.com');
// [ 'google.com', 'www.google.com' ]

// get destination of redirect chain for an url
const domainsChain = await redirectChain.destination('http://google.com');
// 'http://www.google.com/'
```

## License
MIT
