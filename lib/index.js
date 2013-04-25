var path = require("path");
var url = require("url");

var connect = require("connect");
var traceback = require("traceback");
var _ = require("underscore");

var DataStore = require("./request-data").DataStore;


// TODO: expire data
var dataStore = new DataStore();


module.exports = function() {
    var originalApp = connect();
    
    var app = function() {
        return originalApp.apply(this, arguments);
    };
    merge(app, originalApp);
    
    var originalUse = app.use;
    app.use = use;
    
    function use(func) {
        var useTraceback = _.rest(traceback(), 1);
        // TODO: handle other invocations of use (or manipulate stack directly)
        originalUse.call(this, function(request, response, next) {
            if (func !== glimpseMiddleware && func !== glimpseStaticMiddleware) {
                dataStore.addMiddleware(request._requestId, func, useTraceback);
            }
            func.call(this, request, response, next);
        });
        return app;
    }
    
    var glimpseStaticMiddleware = connect.static(path.join(__dirname, "../static"));
    
    app.use(glimpseMiddleware);
    app.use(glimpseStaticMiddleware);
    
    return app;
    
    function glimpseMiddleware(request, response, next) {
        var pathname = url.parse(request.url).pathname;
        var requestDataPrefix = "/glimpse/request/";
        if (pathname.indexOf(requestDataPrefix) === 0) {
            var requestId = pathname.substring(requestDataPrefix.length);
            var data = dataStore.generateGlimpseData(requestId);
            response.writeHead(200, {"Content-Type": "application/javascript"});
            response.end("glimpse.data.initData(" + JSON.stringify(data) + ");");
        } else {
            request._requestId = randomInt();
            dataStore.addRequest(request._requestId, request);
            responseInsertGlimpse(request, response);
            next();
        }
    }
}

function responseInsertGlimpse(request, response) {
    var originalWriteHead = response.writeHead;
    var originalEnd = response.end;
    
    response.writeHead = function writeHead(statusCode, headers) {
        // TODO: handle encoding in content-type
        if (readContentType(headers) === "text/html") {
            response.write = write;
            response.end = end;
        }
        originalWriteHead.apply(this, arguments);
    };
    
    var body = "";
    
    // TODO: handle encoding
    function write(data, encoding) {
        body += data;
    }
    
    function end(data, encoding) {
        if (data) {
            body += data;
        }
        var bodyEnd = "</body>";
        var glimpseTags = '<script src="/glimpse/glimpse.js"></script>' +
            '<script src="/glimpse/request/' + request._requestId + '"></script>';
        originalEnd.call(this, body.replace(bodyEnd, glimpseTags + bodyEnd), encoding);
    }
}

function readContentType(headers) {
    for (var key in headers) {
        if (key.toLowerCase() === "content-type") {
            return headers[key];
        }
    }
}

// Stolen from connect
function merge(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

function randomInt() {
    var min = 0;
    var max = 4294967296;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
