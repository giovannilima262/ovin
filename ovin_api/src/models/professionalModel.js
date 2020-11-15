var Person = require('../models/PersonModel');
var typePerson = require('../utils/enums/typePerson');
var statusPerson = require('../utils/enums/statusPerson');

module.exports = class Professional extends Person {
    constructor(job, text) {
        super(job, text)
        this.type = typePerson.PROFESSIONAL;
    }

    save(res) {
        super.save(res, {
            type: this.type,
            job: this.job,
            text: this.text,
            status: statusPerson.PENDING,
        })
    }

}