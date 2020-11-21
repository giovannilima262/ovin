var Person = require('../models/PersonModel');
var message = require('../utils/strigValues');
var constantUtil = require('../utils/constantUtil');
var statusPerson = require('../utils/enums/statusPerson');
var typePerson = require('../utils/enums/typePerson');

module.exports = class Student extends Person {
    constructor(text, cpf) {
        super(text);
        this.type = typePerson.STUDENT;
        if (!cpf) throw message.CPF_REQUIRED;
        if (!constantUtil.isValidCpf(cpf)) throw message.CPF_NOT_VALID;
        this.cpf = cpf.replace(".", "").replace(".", "").replace("-", "");
    }

    save(res) {
        super.save(res, {
            cpf: this.cpf,
            type: this.type,
            text: this.text,
            status: statusPerson.PENDING,
        })
    }

}
