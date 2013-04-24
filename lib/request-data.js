
exports.DataStore = DataStore;

function DataStore() {
    this._data = {};
}

DataStore.prototype.addRequest = function(requestId, request) {
    this._data[requestId] = {
        method: request.method,
        requestId: requestId,
        uri: generateUri(request)
    };
};

DataStore.prototype.generateGlimpseData = function(requestId) {
    var data = this._data[requestId] || {};
    
    var glimpseData = {};
    for (key in data) {
        glimpseData[key] = data[key];
    }
    
    glimpseData.data = {};
    
    return glimpseData;
}


function generateUri(request) {
    return "http://" + request.headers.host + request.url;
}
