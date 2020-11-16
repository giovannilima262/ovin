
var StudentModel = require('../models/studentModel');
exports.add = function (req, res) {
  const student = new StudentModel(
    req.body.text,
    req.body.cpf
  );
  student.save(res);
};

exports.listResultByStudentCpf = function (req, res) {
  res.json("results");
};
