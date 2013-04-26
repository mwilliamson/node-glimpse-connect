var path = require("path");
var url = require("url");

var connect = require("connect");
var traceback = require("traceback");
var _ = require("underscore");

var DataStore = require("./request-data").DataStore;
var contentTypes = require("./content-types");


var glimpsify = module.exports = function glimpsify(app) {
    var postHoc = !!app;
    if (!app) {
        app = connect();
    }
    
    // TODO: expire data
    var dataStore = new DataStore();
    
    var originalUse = app.use;
    app.use = use;
    
    function use() {
        //~ this._glimpsify();
        originalUse.apply(this, arguments);
        var useTraceback = _.rest(traceback(), 1);
        _glimpsify.call(this, useTraceback);
        return app;
    }
    
    function _glimpsify(useTraceback) {
        this.stack.forEach(function(layer) {
            if (!layer.handle._isGlimpsified) {
                glimpsifyLayer(layer, useTraceback);
            }
        });
    }
    
    function glimpsifyLayer(layer, useTraceback) {
        var handle = layer.handle;
        // TODO: deal with handle with arity of 4
        layer.handle = function(request, response, next) {
            dataStore.addMiddleware(request._requestId, handle, useTraceback);
            return handle.apply(this, arguments);
        };
        layer.handle._isGlimpsified = true;
    }
    
    var glimpseStaticMiddleware = connect.static(path.join(__dirname, "../static"));
    glimpseMiddleware._isGlimpsified = true;
    glimpseStaticMiddleware._isGlimpsified = true;
    
    if (postHoc) {
        app.stack.splice(0, 0, {route: "", handle: glimpseMiddleware}, {route: "", handle: glimpseStaticMiddleware});
        _glimpsify.call(app);
    } else {
        app.use(glimpseMiddleware);
        app.use(glimpseStaticMiddleware);
    }
    
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

module.exports.glimpsify = glimpsify;

function responseInsertGlimpse(request, response) {
    var originalWriteHead = response.writeHead;
    var originalEnd = response.end;
    
    response.writeHead = function writeHead(statusCode, headers) {
        if (contentTypes.isHtml(readContentType(headers))) {
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
            '<script src="/glimpse/glimpse-connect.js"></script>' +
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
