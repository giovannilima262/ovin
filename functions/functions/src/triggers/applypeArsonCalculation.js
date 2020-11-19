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
                    jobKeyWordsOriginal: doc.data().job.keyWords,
                    algorithms: doc.data().algorithms,
                    timestamp: doc.data().timestamp,
                    textKeyWords: removeSpecialCharacterArray(doc.data().text.keyWords),
                    textKeyWordsOriginal: doc.data().text.keyWords
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

            // THIS
            db.collection('groupTextKeyWordsProfessionalsName').doc('1').set({
                groupTextKeyWordsProfessionalsName: groupTextKeyWordsProfessionalsName,
            });


            // GROUP by key words professions (p)
            groupProfessionalsKeyWord = groupByArrayList(listProfessionals, 'jobKeyWords');

            allElements = [];
            listProfessionals.forEach(element => {
                for (let index = 0; index < element['jobKeyWords'].length; index++) {
                    allElements.push(element['jobKeyWords'][index])
                }
            });

            let elementsArrayStringProfessionalsKeyWord = [... new Set(allElements)];

            // GROUP (p) by key words text
            groupTextKeyWordsProfessionalsKeyWord = groupByMapArray(groupProfessionalsKeyWord, 'textKeyWords', elementsArrayStringProfessionalsKeyWord);

            // THIS
            db.collection('groupTextKeyWordsProfessionalsKeyWord').doc('1').set({
                groupTextKeyWordsProfessionalsKeyWord: groupTextKeyWordsProfessionalsKeyWord,
            });


            // get text student
            db.collection('person').where('cpf', '==', change.after.data().cpf).get().then(snapshotPerson => {
                if (snapshotPerson.empty) return;

                let listStudents = []
                let groupTextKeyWordsStudents = []

                snapshotPerson.forEach(doc => {
                    listStudents.push({
                        id: doc.id,
                        algorithms: doc.data().algorithms,
                        timestamp: doc.data().timestamp,
                        textKeyWords: removeSpecialCharacterArray(doc.data().text.keyWords),
                        textKeyWordsOriginal: doc.data().text.keyWords
                    });
                });
                // all
                groupTextKeyWordsStudents = groupByArrayList(listStudents, 'textKeyWords');
                // THIS
                db.collection(`groupTextKeyWordsStudents`).doc('1').set({ groupTextKeyWordsStudents: groupTextKeyWordsStudents });

                // with 5 month divisions


                // apply combinational analysis

                groupTextKeyWordsStudents //  = Map<TextKeyWords>[textKey = List[algorithms = List[name, value]]]

                groupTextKeyWordsProfessionalsName //  = List<ListProfessionalName>[list = Map<TextKeyWords>[textKey = List[algorithms = List[name, value]]], name]

                applyCombinationalAnalysis(groupTextKeyWordsProfessionalsName, groupTextKeyWordsStudents)


            }).catch(error => {
                console.log(error);
            });

        }).catch(error => {
            console.log(error);
        });

}



function applyCombinationalAnalysis(professionals, studentSubjectMatters) {
    professionals.forEach(professional => {
        let professionName = professional.name;
        let textKeyWordsMap = professional.list;
        textKeyWordsMap.forEach(textKeyWord => {
            let textKeyWordName = Object.keys(textKeyWord)[0];
            let textKeyWordMap = textKeyWord[textKeyWordName];
            let resultsProfession = {
                name: professionName,
                textKeyWordName: textKeyWordName,
                algorithms: textKeyWordMap.map(value => value.algorithms),
                textKeyWordsOriginal: textKeyWordMap.map(value => value.textKeyWordsOriginal),
            };
            studentSubjectMatters.forEach(studentSubjectMatter => {
                subjectMatterMap = studentSubjectMatter[resultsProfession.textKeyWordName];

                let resultsStudent = {
                    algorithms: subjectMatterMap.map(value => value.algorithms),
                };
            });


        });
    });
}

function removeSpecialCharacter(value) {
    if (!value) return "";
    return value.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(/ /g, '_');
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
        if (map[name] != null) {
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
            newList.push({ name: name, list: list });
        }
    });
    return newList;
}


function groupByMapArray(map, prop, elementsArrayString) {
    let newList = [];

    map.forEach(item => {
        elementsArrayString.forEach(name => {
            let list = [];
            let allElements = [];
            if (item[name] != null) {
                item[name].forEach(element => {
                    allElements.push(...element[prop])
                });
                console.log(allElements)
                let elementsArray = [... new Set(allElements)];
                elementsArray.forEach(element => {
                    list.push(...[
                        item[name].reduce(function (rv, x) {
                            if (x[prop].indexOf(element) != -1) {
                                (rv[x[prop][x[prop].indexOf(element)]] = rv[x[prop][x[prop].indexOf(element)]] || []).push(x);
                            }
                            return rv;
                        }, {})
                    ]);
                });
                newList.push({ name: name, list: list });
            }
        });
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