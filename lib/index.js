var path = require("path");
var url = require("url");

var connect = require("connect");


exports.wrap = wrap;


// TODO: expire data
var dataPerRequest = {};


function wrap(originalApp) {
    var app = function() {
        return originalApp.apply(this, arguments);
    };
    merge(app, originalApp);
    
    var originalUse = app.use;
    app.use = use;
    
    function use(func) {
        // TODO: handle other invocations of use (or manipulate stack directly)
        originalUse.call(this, func);
        return app;
    }
    
    app.use(function(request, response, next) {
        var pathname = url.parse(request.url).pathname;
        var requestDataPrefix = "/glimpse/request/";
        if (pathname.indexOf(requestDataPrefix) === 0) {
            var requestId = pathname.substring(requestDataPrefix.length);
            var requestData = dataPerRequest[requestId] || {};
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end("glimpse.data.initData(" + JSON.stringify(requestData) + ");");
        } else {
            request._requestId = randomInt();
            dataPerRequest[request._requestId] = {
                method: request.method
            };
            responseInsertGlimpse(request, response);
            next();
        }
    });
    app.use(connect.static(path.join(__dirname, "../static")))
    
    return app;
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
