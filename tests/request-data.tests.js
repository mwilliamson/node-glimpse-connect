var DataStore = require("../lib/request-data").DataStore;


var requestId = "(request id)";

exports["basic glimpse data is extracted from request"] = function(test) {
    var request = fakeRequest({method: "GET"});
    var glimpseData = glimpseDataForRequest(request)
    test.equal(glimpseData.method, "GET");
    test.equal(glimpseData.requestId, requestId);
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
