const functions = require('firebase-functions');
const { functionApplyAlgorithms } = require('./src/triggers/applyApplyAlgorithms');
const { functionPearsonCalculation } = require('./src/triggers/applypeArsonCalculation');

exports.applyAlgorithms = functions.firestore
    .document('person/{personId}')
    .onWrite((change, context) => functionApplyAlgorithms(change, context));

exports.pearsonCalculation = functions.firestore
    .document('person/{personId}')
    .onWrite((change, context) => functionPearsonCalculation(change, context));
