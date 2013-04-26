var contentTypes = require("../lib/content-types");


exports["text/html is detected as HTML content type"] =
    isHtmlTestCase("text/html", true);
    
exports["TEXT/HTML is detected as HTML content type"] =
    isHtmlTestCase("TEXT/HTML", true);

exports["text/plain is not detected as HTML content type"] =
    isHtmlTestCase("text/plain", false);

exports["text/html with encoding is detected as HTML content type"] =
    isHtmlTestCase("text/html; charset=ISO-8859-4", true);
    
exports["ztext/html is not detected as HTML content type"] =
    isHtmlTestCase("ztext/html", false);
    
exports["text/htmlz is not detected as HTML content type"] =
    isHtmlTestCase("text/htmlz", false);

function isHtmlTestCase(contentType, expectedIsHtml) {
    return function(test) {
        test.equal(contentTypes.isHtml(contentType), expectedIsHtml);
        test.done();
    };
}
