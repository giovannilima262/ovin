var message = require('../utils/strigValues');
var server = require('../../server');
firebase = require('firebase')
module.exports = class Person {
    constructor(job, text) {
        if (!job || !job.name) throw message.JOB_NAME_REQUIRED;
        if (!text || !text.value) throw message.TEXT_VALUE_REQUIRED;
        if (!text.key_words) throw message.TEXT_KEY_WORDS_REQUIRED;
        this.job = {
            name: job.name,
            keyWords: !job.key_words ? [] : job.key_words
        };
        this.text = {
            value: text.value,
            keyWords: text.key_words
        }

    }

    save(res, value) {
        server.firestore.collection('person')
            .where('text', '==', this.text)
            .where('type', '==', value.type).get().then(snapshot => {
                if (snapshot.empty) {
                    server.firestore.collection('person').add({
                        ...value,
                        timestamp: firebase.firestore.Timestamp.now()
                    });
                    res.json(message.SAVED_TEXT);
                    return;
                }
                res.json(message.DUPLICATE_TEXT);
            }).catch(error => {
                res.json({ error });
            });
    }
}