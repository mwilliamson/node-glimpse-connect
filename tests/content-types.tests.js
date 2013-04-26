var contentTypes = require("../lib/content-types");


exports["text/html is detected as HTML content type"] =
    isHtmlTestCase("text/html", true);

exports["text/plain is not detected as HTML content type"] =
    isHtmlTestCase("text/plain", false);

function isHtmlTestCase(contentType, expectedIsHtml) {
    return function(test) {
        test.equal(contentTypes.isHtml(contentType), expectedIsHtml);
        test.done();
    };
}
