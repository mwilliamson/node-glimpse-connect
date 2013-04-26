# Glimpse for Connect

This module adds support for [Glimpse](http://getglimpse.com/) to Connect.

## Usage

The recommended way to use Glimpse is to call `glimpseConnect()` instead of `connect()`.
For instance, if your code looks like this:

```javascript
var connect = require("connect");

connect()
    .use(connect.favicon())
    .use(connect.logger('dev'))
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'Sssh!' }))
```

You can change it to:

```javascript
var connect = require("connect");
var glimpseConnect = require("glimpse-connect");

glimpseConnect()
    .use(connect.favicon())
    .use(connect.logger('dev'))
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'Sssh!' }))
```

Then, any page of content-type `text/html` should have Glimpse added to it.
You can open up Glimpse by clicking the Glimpse logo in the bottom-right corner.

If you can't change the initial invocation of `connect()` for some reason,
you can glimpsify the application post-hoc:

```javascript
var connect = require("connect");
var glimpseConnect = require("glimpse-connect");

glimpseConnect.glimpsify(connect())
    .use(connect.favicon())
    .use(connect.logger('dev'))
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'Sssh!' }))
```

If you use Glimpse in this way,
Glimpse won't be able to detect when middleware was added if it was added pre-glimpsification.

Alternatively, you can try global glimpsification.
This is a bit of a hack, and therefore is likely to be quite brittle.
If at all possible, try using the recommended way first.

```javascript
var connect = require("connect");
var glimpseConnect = require("glimpse-connect");

// Call globalGlimpsify() first
glimpseConnect.globalGlimpsify();

// Then create the app
connect()
    .use(connect.favicon())
    .use(connect.logger('dev'))
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'Sssh!' }))
```
