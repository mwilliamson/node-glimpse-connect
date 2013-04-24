var http = require("http");

var q = require("q");
var connect = require("connect");

var glimpseConnect = require("../");

exports.startConnectServer = startConnectServer;


function startConnectServer(app) {
    var port = 56213;
    
    app
        .use(connect.favicon())
        .use(connect.logger('dev'))
        .use(connect.cookieParser())
        .use(connect.session({ secret: 'Sssh!' }))
        .use(function(request, response) {
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.end('<!DOCTYPE html><html><body><p>Hello from Connect!</p></body></html>');
        });
        
    var server = http.createServer(app);
    server.listen(port);
    
    function url(path) {
        if (path.charAt(0) !== "/") {
            path = "/" + path;
        }
        return "http://localhost:" + port + path;
    }
    
    function stop() {
        var deferred = q.defer();
        server.close(function() {
            deferred.resolve();
        });
        return deferred.promise;
    }
    
    return {
        url: url,
        stop: stop
    };
}

if (require.main === module) {
    var server = startConnectServer(glimpseConnect.wrap(connect()));
    console.log("Running on " + server.url("/"));
}
