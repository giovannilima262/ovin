const { db } = require('./auth');
const { CALCULATED } = require('../../utils/enums/statusPerson');
const { PROFESSIONAL, STUDENT } = require('../../utils/enums/typePerson');

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
                    jobNameOriginal: doc.data().job.name,
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
                groupTextKeyWordsStudents = groupByArrayList(listStudents, 'textKeyWords');

                listResultJobs = applyCombinationalAnalysis(groupTextKeyWordsProfessionalsName, groupTextKeyWordsStudents, false)
                listResultJobsKeyWord = applyCombinationalAnalysis(groupTextKeyWordsProfessionalsKeyWord, groupTextKeyWordsStudents, true)
                db.collection('results').doc(change.after.data().cpf).set({
                    idPerson: change.after.id,
                    cpfPerson: change.after.data().cpf,
                    typePerson: STUDENT,
                    jobs: [...listResultJobs, ...listResultJobsKeyWord],
                    timestamp: new Date()
                });


            }).catch(error => {
                console.log(error);
            });

        }).catch(error => {
            console.log(error);
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
                return rv;
            }, {})
        ]);
    });
    return list;

}

function applyCombinationalAnalysis(professionals, studentSubjectMatters, isJobKeyWords) {
    let listResult = [];
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
                textKeyWords: [... new Set(textKeyWordMap.map(value => value.textKeyWords).reduce((a, b) => a.concat(b)))],
                textKeyWordsOriginal: [... new Set(textKeyWordMap.map(value => value.textKeyWordsOriginal).reduce((a, b) => a.concat(b)))],
                jobName: textKeyWordMap[0].jobName,
                jobNameOriginal: textKeyWordMap[0].jobNameOriginal,
                jobKeyWords: [... new Set(textKeyWordMap.map(value => value.jobKeyWords).reduce((a, b) => a.concat(b)))],
                jobKeyWordsOriginal: [... new Set(textKeyWordMap.map(value => value.jobKeyWordsOriginal).reduce((a, b) => a.concat(b)))],
            };
            studentSubjectMatters.forEach(studentSubjectMatter => {
                subjectMatterMap = studentSubjectMatter[resultsProfession.textKeyWordName];
                if (subjectMatterMap) {
                    let resultsStudent = {
                        algorithms: subjectMatterMap.map(value => value.algorithms),
                    };

                    studentAlgorithms = groupResults(resultsStudent)
                    professionAlgorithms = groupResults(resultsProfession)

                    studentAlgorithms.forEach(studentR => {

                        let filterProfessionAlgorithms = professionAlgorithms.filter(profession => profession.name == studentR.name)
                        if (filterProfessionAlgorithms.length > 0) {
                            let professionR = filterProfessionAlgorithms[0];
                            let numberCombinations = 0;
                            let arrayCombination = [];
                            let arrayCompare = [];

                            if (studentR.values.length > professionR.values.length) {
                                numberCombinations = professionR.values.length;
                                arrayCombination = studentR.values;
                                arrayCompare = professionR.values;
                            } else if (professionR.values.length > studentR.values.length) {
                                numberCombinations = studentR.values.length;
                                arrayCombination = professionR.values;
                                arrayCompare = studentR.values;
                            }
                            let peasonResult = 0;
                            if (numberCombinations == 0) {
                                peasonResult = Math.abs(pearson(studentR.values, professionR.values));
                            } else {
                                peasonResult = getValuePearsonCombination(arrayCombination, arrayCompare, numberCombinations)
                            }
                            listResult.push({
                                jobs: {
                                    textKeyWordName: resultsProfession.textKeyWordName,
                                    textKeyWords: resultsProfession.textKeyWords,
                                    textKeyWordsOriginal: resultsProfession.textKeyWordsOriginal,
                                    algorithm: studentR.name,
                                    name: professionName,
                                    value: peasonResult,
                                    jobName: resultsProfession.jobName,
                                    jobNameOriginal: resultsProfession.jobNameOriginal,
                                    jobKeyWords: isJobKeyWords ? resultsProfession.jobKeyWords : null,
                                    jobKeyWordsOriginal: isJobKeyWords ? resultsProfession.jobKeyWordsOriginal : null,
                                }
                            });
                        }

                    });
                }


            });


        });
    });

    return listResult;
}

function getValuePearsonCombination(arrayCombination, arrayCompare, numberCombinations) {
    let values = [];
    combine(arrayCombination, numberCombinations).forEach(value => {
        values.push(Math.abs(pearson(value, arrayCompare)))
    });
    if (values.length == 0) return 0;
    return values.reduce(function (a, b) {
        return a + b;
    }, 0) / values.length
}

function combine(a, q) {
    var n = a.length - 1, l = n - q + 1, x = 0, c = [], z = -1, p, j, d, i;
    if (q > n || q < 2) return c;
    for (p = [], i = q; p[--i] = i;);
    while (x <= l) {
        for (c[++z] = [], j = -1; ++j < q; c[z][j] = a[p[j]]);
        if (++p[j - 1] > n)
            while (j--)
                if (!j && x++, (d = p[j]) < l + j) {
                    while (j < q) p[j++] = ++d;
                    break;
                }
    }
    return c;
};

function groupResults(result) {
    let algorithms = [];
    let results = [];
    result.algorithms.forEach(algorithmsOne => {
        algorithmsOne.forEach(algorithm => {
            algorithms.push(algorithm)
        });
    })
    groupsAlgorithms = groupBy(algorithms, 'name')
    Object.keys(groupsAlgorithms).forEach(name => {
        results.push({ name: name, values: groupsAlgorithms[name].map(value => value.value) })
    });
    return results;
}


function groupBy(arr, prop) {
    return arr.reduce(function (rv, x) {
        (rv[x[prop]] = rv[x[prop]] || []).push(x);
        return rv;
    }, {});
}

function pearson(x, y) {
    let n = x.length;
    let idx = Array.from({ length: n }, (x, i) => i);

    let avgX = x.reduce((a, b) => a + b) / n;
    let avgY = y.reduce((a, b) => a + b) / n;

    let numMult = idx.map(i => (x[i] - avgX) * (y[i] - avgY));
    let numerator = numMult.reduce((a, b) => a + b);

    let denomX = idx.map(i => Math.pow((x[i] - avgX), 2)).reduce((a, b) => a + b);
    let denomY = idx.map(i => Math.pow((y[i] - avgY), 2)).reduce((a, b) => a + b);
    let denominator = Math.sqrt(denomX * denomY);

    return numerator / denominator || 0

};