
exports.DataStore = DataStore;

function DataStore() {
    this._data = {};
}

DataStore.prototype.addRequest = function(requestId, request) {
    this._data[requestId] = {
        method: request.method,
        requestId: requestId
    };
};

DataStore.prototype.generateGlimpseData = function(requestId) {
    var requestData = this._data[requestId] || {};
    return requestData;
}
