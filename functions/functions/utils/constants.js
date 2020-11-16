exports.removeSpecialCharacterArray = function (values) {
    if (!values) return "";
    const newArray = [];
    values.forEach(element => {
        newArray.push(removeSpecialCharacter(element));
    });
    return newArray;
}

exports.removeSpecialCharacter = function (value) {
    if (!value) return "";
    return value.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(" ", "");
}

exports.groupBy = function (arr, prop) {
    return arr.reduce(function (rv, x) {
        (rv[x[prop]] = rv[x[prop]] || []).push(x);
        return rv;
    }, {});
}

exports.groupArray = function (array, prop) {
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