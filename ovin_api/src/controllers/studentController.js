
var StudentModel = require('../models/studentModel');
var PersonModel = require('../models/personModel');
exports.add = function (req, res) {
  const student = new StudentModel(
    req.body.text,
    req.body.cpf
  );
  student.save(res);
};

exports.listResultByStudentCpf = function (req, res) {
  PersonModel.getResults(res, req.params.id);
};
