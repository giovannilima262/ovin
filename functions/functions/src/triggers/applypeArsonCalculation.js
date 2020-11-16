const { db } = require('./auth');
const { CALCULATED, PENDING } = require('../../utils/enums/statusPerson');
const { PROFESSIONAL, STUDENT } = require('../../utils/enums/typePerson');
const { removeSpecialCharacter, removeSpecialCharacterArray, groupBy } = require('../../utils/constants');
const { snapshotConstructor } = require('firebase-functions/lib/providers/firestore');

exports.functionPearsonCalculation = async function (change, context) {
    // Deleted.
    if (!change.after.exists) {
        return;
    }
    const after = change.after;
    const personId = context.params.personId;
    if (after.data().status !== CALCULATED || after.data().type !== STUDENT) return;

    await db.collection('person')
        .where('status', '==', CALCULATED)
        .where('type', '==', PROFESSIONAL)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                return;
            }
            const listProfessionals = []
            const groupProfessionalsName = []
            const groupProfessionalsKeyWord = []
            const groupTextKeyWordsProfessionalsName = []
            const groupTextKeyWordsProfessionalsKeyWord = []
            snapshot.forEach(doc => {
                listProfessionals.push({
                    id: doc.id,
                    jobName: removeSpecialCharacter(doc.data().job.name),
                    jobKeyWords: removeSpecialCharacterArray(doc.data().job.keyWords),
                    algorithms: doc.data().algorithms,
                    timestamp: doc.data().timestamp,
                    textKeyWords: removeSpecialCharacterArray(doc.data().text.keyWords)
                });
            });

            // GROUP by professions (P)
            groupProfessionalsName = groupBy(listProfessionals, 'jobName');

            // GROUP (P) by key words text
            groupTextKeyWordsProfessionalsName = groupByArray(groupProfessionalsName, 'textKeyWords');


            // GROUP by key words professions (p)
            groupProfessionalsKeyWord = groupByArray(listProfessionals, 'jobKeyWords');


            // GROUP (p) by key words text
            groupTextKeyWordsProfessionalsKeyWord = groupByArray(groupProfessionalsKeyWord, 'textKeyWords');



            // get text student

            db.collection('person').where('cpf', '==', change.after.data().cpf).get().then(snapshot => {

                if (snapshot.empty) {
                    return;
                }

                const listStudents = []
                const groupTextKeyWordsStudents = []

                snapshot.forEach(doc => {
                    listStudents.push({
                        id: doc.id,
                        algorithms: doc.data().algorithms,
                        timestamp: doc.data().timestamp,
                        textKeyWords: removeSpecialCharacterArray(doc.data().text.keyWords)
                    });
                });

                // all
                groupTextKeyWordsStudents = groupByArray(listStudents, 'textKeyWords');

                // with 5 month divisions


                // apply combinational analysis

            }).catch(error => {
                console.log(error);
            });



        }).catch(error => {
            console.log(error);
        });

}