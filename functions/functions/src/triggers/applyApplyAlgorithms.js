const { db } = require('./auth');
const { CALCULATED, PENDING } = require('../../utils/enums/statusPerson');
const { OPTIONLEXICON, SENTIWORDNET } = require('../../utils/enums/nameAlgorithm');
const { functionOptionLexicon } = require('../algorithms/optionLexicon');
const { functionSentiWordNet } = require('../algorithms/sentiWordNet');


exports.functionApplyAlgorithms = function (change, context) {
    // Deleted.
    if (!change.after.exists) {
        return;
    }
    const after = change.after;
    const personId = context.params.personId;
    if (after.data().status !== PENDING) return;

    const valueOptionLexicon = functionOptionLexicon(after.data().text.value);
    const valueSentiWordNet = functionSentiWordNet(after.data().text.value);
    db.doc(`person/${personId}`).update({
        status: CALCULATED,
        algorithms: [
            {
                name: OPTIONLEXICON,
                value: valueOptionLexicon
            },
            {
                name: SENTIWORDNET,
                value: valueSentiWordNet
            }
        ]
    });

}