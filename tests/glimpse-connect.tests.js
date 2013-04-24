var assert = require("assert");
var glimpseConnect = require("../");

var connect = require("connect");

var test = require("./testing").test;
var startConnectServer = require("./server").startConnectServer;
var requests = require("./requests")


exports["starting server with glimpse disabled does not show glimpse icon"] = test(function() {
    var server = startConnectServer(connect());
    return requests.get(server.url("/"))
        .then(function(response) {
            assert.ok(stringContains(response.body, "Hello from Connect!"));
            assert.equal(hasGlimpse(response), false);
        })
        .fin(server.stop);
});

exports["starting server with glimpse enabled shows glimpse icon"] = test(function() {
    var server = startConnectServer(glimpseConnect.wrap(connect()));
    return requests.get(server.url("/"))
        .then(function(response) {
            assert.ok(stringContains(response.body, "Hello from Connect!"));
            assert.equal(hasGlimpse(response), true);
        })
        .fin(server.stop);
});

function hasGlimpse(response) {
    return stringContains(response.body, "glimpse-icon");
}

function stringContains(haystack, needle) {
    return haystack.indexOf(needle) !== -1;
}
