var q = require("q");


exports.test = test;


function test(testFunc) {
    return function(test) {
        q.when(testFunc(), function() {
            test.done();
        }, function(error) {
            test.ifError(error);
            test.done();
        })
        .done();
    };
};
