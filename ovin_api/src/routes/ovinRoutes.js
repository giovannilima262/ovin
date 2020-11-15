module.exports = function (app) {
  var professionalController = require('../controllers/professionalController');
  var studentController = require('../controllers/studentController');

  app.route('/professional')
    .post(professionalController.add);

  app.route('/student')
    .post(studentController.add)
    .get(studentController.listResultByStudentCpf);

};