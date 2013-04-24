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

function fakeRequest(request) {
    return request;
}

function glimpseDataForRequest(request) {
    var dataStore = new DataStore();
    dataStore.addRequest(requestId, request);
    return dataStore.generateGlimpseData(requestId);
}
