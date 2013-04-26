var assert = require("assert");

var connect = require("connect");

var glimpseConnect = require("../");
var test = require("./testing").test;
var startConnectServer = require("./server").startConnectServer;
var requests = require("./requests")


exports["starting server with global glimpsification includes glimpse script"] = test(function() {
    glimpseConnect.globalGlimpsify();
    var server = startConnectServer(connect());
    return requests.get(server.url("/"))
        .then(function(response) {
            assert.ok(stringContains(response.body, "Hello from Connect!"));
            assert.equal(hasGlimpse(response), true);
        })
        .fin(server.stop);
});

function hasGlimpse(response) {
    return stringContains(response.body, "glimpse.js");
}

function stringContains(haystack, needle) {
    return haystack.indexOf(needle) !== -1;
}
