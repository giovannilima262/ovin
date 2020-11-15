exports.isValidCpf = function (value) {
    var sum;
    var rest;
    sum = 0;
    if (!value || value == "00000000000") return false;
    value = value.replace(".", "").replace(".", "").replace("-", "");
    for (i = 1; i <= 9; i++) sum = sum + parseInt(value.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;

    if ((rest == 10) || (rest == 11)) rest = 0;
    if (rest != parseInt(value.substring(9, 10))) return false;

    sum = 0;
    for (i = 1; i <= 10; i++) sum = sum + parseInt(value.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;

    if ((rest == 10) || (rest == 11)) rest = 0;
    if (rest != parseInt(value.substring(10, 11))) return false;
    return true;
}