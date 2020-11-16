var opinionLexicon = require('opinion-lexicon');

const polarities = {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    NEUTRAL: 'neutral',
}

exports.functionOptionLexicon = function (text) {
    let sum = 0;
    const array = text.split(" ");
    array.forEach(element => {
        sum += getValue(element);
    });

    return sum / array.length;
}

function getValue(word) {
    switch (opinionLexicon.getOpinion(word)) {
        case polarities.POSITIVE:
            return 2;
        case polarities.NEGATIVE:
            return 1;
        case polarities.NEGATIVE:
            return 0;
        default:
            return 0;
    }
}
