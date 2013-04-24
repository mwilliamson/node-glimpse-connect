var path = require("path");

var traceback = require("traceback");

var DataStore = require("../lib/request-data").DataStore;
var fakeMiddleware = require("./middleware").fakeMiddleware;
var anonymousMiddleware = require("./middleware").anonymousMiddleware;

var requestId = "(request id)";

exports["basic glimpse data is extracted from request"] = function(test) {
    var request = fakeRequest({
        method: "GET",
        headers: {'host': 'eg.com'},
        url: "/hello"
    });
    var glimpseData = glimpseDataForRequest(request)
    test.equal(glimpseData.method, "GET");
    test.equal(glimpseData.requestId, requestId);
    // TODO: https
    test.equal(glimpseData.uri, "http://eg.com/hello");
    test.ok(glimpseData.data);
    test.done();
};

exports["request tab is generated with request details"] = function(test) {
    var request = fakeRequest({
        method: "GET",
        headers: {'host': 'eg.com'},
        url: "/hello"
    });
    var glimpseData = glimpseDataForRequest(request)
    var requestTab = glimpseData.data.Request;
    test.equal(requestTab.name, "Request");
    test.deepEqual(requestTab.data.Headers, {'host': 'eg.com'});
    test.done();
};

exports["middleware tab is empty if no middleware is tracked"] = function(test) {
    var request = fakeRequest({});
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    var glimpseData = dataStore.generateGlimpseData(requestId);
    var middlewareTab = glimpseData.data.Middleware;
    test.equal(middlewareTab.name, "Middleware");
    test.deepEqual(middlewareTab.data, [["Name", "Path", "Line", "Col"]]);
    test.done();
};

exports["middleware tab contains names of middleware functions that have been tracked"] = function(test) {
    var request = fakeRequest({});
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    dataStore.addMiddleware(requestId, fakeMiddleware, generateStackTrace(fakeMiddleware));
    dataStore.addMiddleware(requestId, anonymousMiddleware, generateStackTrace(anonymousMiddleware));
    var glimpseData = dataStore.generateGlimpseData(requestId);
    var middlewareTab = glimpseData.data.Middleware;
    test.equal(middlewareTab.name, "Middleware");
    test.deepEqual(middlewareTab.data[1][0], "fakeMiddleware");
    test.deepEqual(middlewareTab.data[2][0], "(anonymous)");
    test.done();
};

exports["middleware tab contains source details for tracked middleware"] = function(test) {
    var request = fakeRequest({});
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    dataStore.addMiddleware(requestId, fakeMiddleware, generateStackTrace(fakeMiddleware));
    var glimpseData = dataStore.generateGlimpseData(requestId);
    var middlewareTab = glimpseData.data.Middleware;
    // TODO: source details are from the call to next, rather than the function definition itself
    // Could parse the source file and find the relevant function definition based on the trace?
    var data = middlewareTab.data[1];
    test.deepEqual(data[1], path.join(__dirname, "middleware.js")); // Source file
    test.deepEqual(data[2], 2); // Line number
    test.deepEqual(data[3], 5); // Column number
    test.done();
};

function fakeRequest(request) {
    request.headers = request.headers || {};
    return request;
}

function generateStackTrace(func) {
    // Only works with middleware that immediately calls next()
    var stack;
    func(null, null, function() {
        stack = traceback();
    });
    return stack;
}

function glimpseDataForRequest(request) {
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    return dataStore.generateGlimpseData(requestId);
}
