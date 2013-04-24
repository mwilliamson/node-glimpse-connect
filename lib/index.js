var path = require("path");

var connect = require("connect");


exports.wrap = wrap;


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
        responseInsertGlimpse(response);
        next();
    });
    app.use(connect.static(path.join(__dirname, "../static")))
    
    return app;
}

function responseInsertGlimpse(response) {
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
        var glimpseTags = '<script src="/glimpse/glimpse.js"></script>';
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
