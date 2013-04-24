function fakeMiddleware(request, response, next) {
    next();
}

var anonymousMiddleware = (function() {
    return function(request, response, next) {
        next();
    };
})();

exports.fakeMiddleware = fakeMiddleware;
exports.anonymousMiddleware = anonymousMiddleware;
