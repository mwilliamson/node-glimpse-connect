var assert = require("assert");
var glimpseConnect = require("../");

var connect = require("connect");

var test = require("./testing").test;
var startConnectServer = require("./server").startConnectServer;
var requests = require("./requests")


exports["starting server with glimpse disabled does not include glimpse script"] = test(function() {
    var server = startConnectServer(connect());
    return requests.get(server.url("/"))
        .then(function(response) {
            assert.ok(stringContains(response.body, "Hello from Connect!"));
            assert.equal(hasGlimpse(response), false);
        })
        .fin(server.stop);
});

exports["starting server with glimpse includes glimpse script"] = test(function() {
    var server = startConnectServer(glimpseConnect());
    return requests.get(server.url("/"))
        .then(function(response) {
            assert.ok(stringContains(response.body, "Hello from Connect!"));
            assert.equal(hasGlimpse(response), true);
        })
        .fin(server.stop);
});

exports["request JSON contains HTTP request method"] = test(function() {
    var server = startConnectServer(glimpseConnect());
    return requests.get(server.url("/"))
        .then(function(response) {
            var scriptRegexResult = /<script src="(\/glimpse\/request\/[^\/]+)">/.exec(response.body);
            var dataPath = scriptRegexResult[1];
            return server.url(dataPath);
        })
        .then(requests.get)
        .then(function(response) {
            var responseRegexResult = /^glimpse\.data\.initData\((.*)\);\s*$/.exec(response.body);
            var data = JSON.parse(responseRegexResult[1]);
            assert.equal(data.method, "GET");
        })
        .fin(server.stop);
});

function hasGlimpse(response) {
    return stringContains(response.body, "glimpse.js");
}

function stringContains(haystack, needle) {
    return haystack.indexOf(needle) !== -1;
}
