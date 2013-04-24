var DataStore = require("../lib/request-data").DataStore;


exports["request method is generated"] = function(test) {
    var request = fakeRequest({method: "GET"});
    var glimpseData = glimpseDataForRequest(request)
    test.equal(glimpseData.method, "GET");
    test.done();
};

function fakeRequest(request) {
    return request;
}

function glimpseDataForRequest(request) {
    var dataStore = new DataStore();
    dataStore.addRequest("42", request);
    return dataStore.generateGlimpseData("42");
}
