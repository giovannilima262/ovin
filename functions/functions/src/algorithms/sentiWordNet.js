var sw = require('sentiword');

exports.functionSentiWordNet = function (text) {
    return sw(text).avgSentiment
}

