var DataStore = require("../lib/request-data").DataStore;


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
    test.deepEqual(middlewareTab.data, [["Name"]]);
    test.done();
};

exports["middleware tab contains names of middleware functions that have been tracked"] = function(test) {
    var request = fakeRequest({});
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    dataStore.addMiddleware(requestId, fakeMiddleware);
    var glimpseData = dataStore.generateGlimpseData(requestId);
    var middlewareTab = glimpseData.data.Middleware;
    test.equal(middlewareTab.name, "Middleware");
    test.deepEqual(middlewareTab.data, [["Name"], ["fakeMiddleware"]]);
    test.done();
};

function fakeRequest(request) {
    request.headers = request.headers || {};
    return request;
}

function fakeMiddleware(request, response, next) {
}

function glimpseDataForRequest(request) {
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    return dataStore.generateGlimpseData(requestId);
}
