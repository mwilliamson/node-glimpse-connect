exports.isHtml = isHtml;

function isHtml(contentType) {
    return !!/^text\/html(?:;|$)/i.exec(contentType);
}
