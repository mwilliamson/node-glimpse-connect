var q = require("q");
var request = require("request");


exports.get = get;



function get(options) {
    var deferred = q.defer();
    
    request.get(options, function(err, response, body) {
        if (err) {
            deferred.reject(err);
        } else {
            response.body = body;
            deferred.resolve(response);
        }
    });
    
    return deferred.promise;
}
