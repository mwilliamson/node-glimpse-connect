
exports.DataStore = DataStore;

function DataStore() {
    this._data = {};
}

DataStore.prototype.addRequest = function(requestId, request) {
    this._data[requestId] = {
        method: request.method,
        requestId: requestId,
        uri: generateUri(request),
        headers: request.headers
    };
};

DataStore.prototype._get = function(requestId) {
    if (!this._data[requestId]) {
        this._data[requestId] = {};
    }
    return this._data[requestId];
}

DataStore.prototype.addMiddleware = function(requestId, middleware) {
    var data = this._get(requestId);
    data.middleware = data.middleware || [];
    data.middleware.push({
        name: middleware.name
    });
}

DataStore.prototype.generateGlimpseData = function(requestId) {
    var data = this._get(requestId);
    
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
    var tabData = [["Name"]];
    (data.middleware || []).forEach(function(middleware) {
        tabData.push([middleware.name]);
    });
    
    return {
        name: "Middleware",
        data: tabData
    };
}


function generateUri(request) {
    return "http://" + request.headers.host + request.url;
}
