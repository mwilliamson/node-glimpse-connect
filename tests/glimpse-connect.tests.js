var assert = require("assert");
var path = require("path");

var connect = require("connect");

var glimpseConnect = require("../");
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
            return getGlimpseRequestData(server, response);
        })
        .then(function(data) {
            assert.equal(data.method, "GET");
        })
        .fin(server.stop);
});

exports["request JSON contains middleware details"] = test(function() {
    var server = startConnectServer(glimpseConnect());
    return requests.get(server.url("/"))
        .then(function(response) {
            return getGlimpseRequestData(server, response);
        })
        .then(function(data) {
            // The first middleware should be favicon since we want to
            // ignore Glimpse middleware
            var firstMiddleware = data.data.Middleware.data[0];
            assert.equal(firstMiddleware.name, "favicon");
            var usageStackTrace = firstMiddleware.useStackTrace;
            assert.equal(usageStackTrace[0].path, path.join(__dirname, "server.js"));
        })
        .fin(server.stop);
});

function getGlimpseRequestData(server, response) {
    var scriptRegexResult = /<script src="(\/glimpse\/request\/[^\/]+)">/.exec(response.body);
    var dataPath = scriptRegexResult[1];
    var url = server.url(dataPath);
    return requests.get(url)
        .then(function(response) {
            var responseRegexResult = /^glimpse\.data\.initData\((.*)\);\s*$/.exec(response.body);
            return JSON.parse(responseRegexResult[1]);
        })
}

function hasGlimpse(response) {
    return stringContains(response.body, "glimpse.js");
}

function stringContains(haystack, needle) {
    return haystack.indexOf(needle) !== -1;
}
