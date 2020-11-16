var Person = require('../models/PersonModel');
var typePerson = require('../utils/enums/typePerson');
var statusPerson = require('../utils/enums/statusPerson');

module.exports = class Professional extends Person {
    constructor(job, text) {
        super(text)
        if (!job || !job.name) throw message.JOB_NAME_REQUIRED;
        this.type = typePerson.PROFESSIONAL;
        this.job = {
            name: job.name,
            keyWords: !job.key_words ? [] : job.key_words
        };
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