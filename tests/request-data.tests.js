var path = require("path");

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
    test.deepEqual(middlewareTab.data.length, 0);
    test.done();
};

exports["middleware tab contains names of middleware functions that have been tracked"] = function(test) {
    var request = fakeRequest({});
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    dataStore.addMiddleware(requestId, fakeMiddleware);
    dataStore.addMiddleware(requestId, anonymousMiddleware);
    var glimpseData = dataStore.generateGlimpseData(requestId);
    var middlewareTab = glimpseData.data.Middleware;
    test.equal(middlewareTab.name, "Middleware");
    test.deepEqual(middlewareTab.data[0].name, "fakeMiddleware");
    test.deepEqual(middlewareTab.data[1].name, "(anonymous)");
    test.done();
};

exports["middleware tab contains source details for tracked middleware"] = function(test) {
    var request = fakeRequest({});
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    dataStore.addMiddleware(requestId, fakeMiddleware);
    var glimpseData = dataStore.generateGlimpseData(requestId);
    var middlewareTab = glimpseData.data.Middleware;
    var data = middlewareTab.data[0];
    test.deepEqual(data.sourcePath, path.join(__dirname, "middleware.js"));
    test.deepEqual(data.sourceLine, 0);
    test.deepEqual(data.sourceColumn, 85);
    test.done();
};

exports["middleware tab contains source details for use invocation"] = function(test) {
    var request = fakeRequest({});
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    dataStore.addMiddleware(requestId, fakeMiddleware, [{path: "here.js"}]);
    var glimpseData = dataStore.generateGlimpseData(requestId);
    var middlewareTab = glimpseData.data.Middleware;
    var data = middlewareTab.data[0];
    var useStackTrace = data.useStackTrace;
    test.deepEqual(useStackTrace[0].path, "here.js");
    test.done();
};

function fakeRequest(request) {
    request.headers = request.headers || {};
    return request;
}

function glimpseDataForRequest(request) {
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    return dataStore.generateGlimpseData(requestId);
}
