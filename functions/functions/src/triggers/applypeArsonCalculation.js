const { db } = require('./auth');
const { CALCULATED, PENDING } = require('../../utils/enums/statusPerson');
const { PROFESSIONAL, STUDENT } = require('../../utils/enums/typePerson');
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
            let listProfessionals = []
            let groupProfessionalsName = []
            let groupProfessionalsKeyWord = []
            let groupTextKeyWordsProfessionalsName = []
            let groupTextKeyWordsProfessionalsKeyWord = []
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

            let allElements = [];
            listProfessionals.forEach(element => {
                allElements.push(element['jobName'])
            });

            let elementsArrayStringProfessionals = [... new Set(allElements)];

            // GROUP by professions (P)
            groupProfessionalsName = groupBy(listProfessionals, 'jobName');

            // GROUP (P) by key words text
            groupTextKeyWordsProfessionalsName = groupByArray(groupProfessionalsName, 'textKeyWords', elementsArrayStringProfessionals);

            // GROUP by key words professions (p)
            groupProfessionalsKeyWord = groupByArrayList(listProfessionals, 'jobKeyWords');

            allElements = [];
            listProfessionals.forEach(element => {
                for (let index = 0; index < element['textKeyWords'].length; index++) {
                    allElements.push(element['textKeyWords'][index])
                }
            });

            let elementsArrayStringProfessionalsKeyWord = [... new Set(allElements)];

            // GROUP (p) by key words text
            groupTextKeyWordsProfessionalsKeyWord = groupByArray(groupProfessionalsKeyWord, 'textKeyWords', elementsArrayStringProfessionalsKeyWord);

            // remove
            db.collection('groupTextKeyWordsProfessionalsKeyWord').doc('1').set({
                groupTextKeyWordsProfessionalsKeyWord: groupTextKeyWordsProfessionalsKeyWord,
            });

            // get text student

            db.collection('person').where('cpf', '==', change.after.data().cpf).get().then(snapshot => {

                if (snapshot.empty) {
                    return;
                }

                let listStudents = []
                let groupTextKeyWordsStudents = []

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
                db.doc(`groupTextKeyWordsProfessionalsKeyWord`).set(groupTextKeyWordsStudents);

                // with 5 month divisions




                // apply combinational analysis

                console.log(groupTextKeyWordsStudents);

            }).catch(error => {
                console.log(error);
            });



        }).catch(error => {
            console.log(error);
        });

}


function removeSpecialCharacter(value) {
    if (!value) return "";
    return value.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(" ", "");
}


function removeSpecialCharacterArray(values) {
    if (!values) return "";
    const newArray = [];
    values.forEach(element => {
        newArray.push(removeSpecialCharacter(element));
    });
    return newArray;
}


function groupBy(arr, prop) {
    return arr.reduce(function (rv, x) {
        (rv[x[prop]] = rv[x[prop]] || []).push(x);
        return rv;
    }, {});
}


function groupByArray(map, prop, elementsArrayString) {
    let newList = [];

    elementsArrayString.forEach(name => {
        let list = [];
        let allElements = [];
        map[name].forEach(element => {
            allElements.push(...element[prop])
        });

        let elementsArray = [... new Set(allElements)];
        elementsArray.forEach(element => {
            list.push(...[
                map[name].reduce(function (rv, x) {
                    if (x[prop].indexOf(element) != -1) {
                        (rv[x[prop][x[prop].indexOf(element)]] = rv[x[prop][x[prop].indexOf(element)]] || []).push(x);
                    }
                    return rv;
                }, {})
            ]);
        });
        newList.push({ name: name, list: list })
    });
    return newList;
}

function groupByArrayList(array, prop) {
    const list = [];
    const allElements = [];
    array.forEach(element => {
        allElements.push(...element[prop])
    });

    const elementsArray = [... new Set(allElements)];
    elementsArray.forEach(element => {
        list.push(...[
            array.reduce(function (rv, x) {
                if (x[prop].indexOf(element) != -1) {
                    (rv[x[prop][x[prop].indexOf(element)]] = rv[x[prop][x[prop].indexOf(element)]] || []).push(x);
                }
                console.log(x[prop].includes(element))
                return rv;
            }, {})
        ]);
    });
    return list;

}