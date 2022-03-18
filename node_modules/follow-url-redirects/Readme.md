# Follow url redirects
[![NPM version](https://img.shields.io/npm/v/follow-url-redirects)](https://www.npmjs.com/package/follow-url-redirects)
[![Actions Status](https://github.com/mrdaano/follow-url-redirects/workflows/Node.js%20CI/badge.svg)](https://github.com/mrdaano/follow-url-redirects/actions)

With this Node JS package you can follow all redirects from a given url.

## Example
In this example, a bit.ly link has been created that will eventually lead to google.com.

```javascript
const followRedirects = require('follow-url-redirects');

followUrlRedirects('https://bit.ly/3cScyDF').then(result => console.log(result));
```
This example returns the following result:
```json
[
    {
        "url": "https://bit.ly/3cScyDF",
        "code": 301,
        "cookies": {},
        "queryParams": {}
    },
    {
        "url": "http://google.com/",
        "code": 301,
        "cookies": {},
        "queryParams": {}
    },
    {
        "url": "http://www.google.com/",
        "code": 200,
        "cookies": {},
        "queryParams": {}
    }
]
```
## Extra options
There is also the possibility to add extra options as a 2nd parameter.
| Option | Default | Description |
|--------|---------|-------------|
| timeout | 10000(ms) | When a request takes too long it stops. In this case after 10 seconds |
| maxRedirects | 10 | The maximum number of redirects. |
### Example with options
```javascript
const followRedirects = require('follow-url-redirects');

const options = {
    timeout: 3 * 1000, // 3 seconds
    maxRedirects: 5
};

followUrlRedirects('https://bit.ly/3cScyDF', options).then(result => console.log(result));
```