var _ = require("underscore");
var inspectFunction = require("function-inspector").inspect;
var Dequeue = require("dequeue");


exports.DataStore = DataStore;

function DataStore(options) {
    options = options || {};
    
    this._requestIds = new Dequeue();
    this._data = {};
    this._bufferSize = options.bufferSize || 20;
}

DataStore.prototype.addRequest = function(requestId, request) {
    this._push(requestId, {
        method: request.method,
        requestId: requestId,
        uri: generateUri(request),
        headers: request.headers
    });
    this._requestIds.push(requestId);
    while (this._requestIds.length > this._bufferSize) {
        var toRemove = this._requestIds.shift();
        delete this._data[toRemove];
    }
};

DataStore.prototype._get = function(requestId) {
    return this._data[requestId];
};

DataStore.prototype._push = function(requestId, value) {
    this._data[requestId] = value;
};

DataStore.prototype.addMiddleware = function(requestId, middleware, useStackTrace) {
    var data = this._get(requestId);
    if (!data) {
        return;
    }
    data.middleware = data.middleware || [];
    
    var source = inspectFunction(middleware);
    
    data.middleware.push({
        name: middleware.name,
        source: {
            path: source.File,
            line: source.LineNumber,
            col: source.ColumnNumber
        },
        useStackTrace: useStackTrace ? useStackTrace.map(function(stackElement) {
            return _.pick(stackElement, "path", "line", "col");
        }) : "(unknown)"
    });
}

DataStore.prototype.generateGlimpseData = function(requestId) {
    var data = this._get(requestId);
    if (!data) {
        return null;
    }
    
    var glimpseData = {};
    for (key in data) {
        glimpseData[key] = data[key];
    }
    
    glimpseData.data = {
        "Request": generateRequestTab(data),
        "Middleware": generateMiddlewareTab(data)
    };
    
    return glimpseData;
}

function generateRequestTab(data) {
    return {
        name: "Request",
        data: {
            Headers: data.headers
        }
    };
}

function generateMiddlewareTab(data) {
    var tabData = (data.middleware || []).map(function(middleware) {
        return {
            name: middleware.name || "(anonymous)",
            sourcePath: middleware.source.path,
            sourceLine: middleware.source.line,
            sourceColumn: middleware.source.col,
            useStackTrace: middleware.useStackTrace
        };
    });
    
    return {
        name: "Middleware",
        data: tabData
    };
}


function generateUri(request) {
    return "http://" + request.headers.host + request.url;
}
