const Professional = require("../models/professionalModel");

var ProfessionalModel = require('../models/professionalModel');
var typePerson = require('../utils/enums/typePerson');
exports.add = function (req, res) {
  const professional = new ProfessionalModel(
    req.body.job,
    req.body.text
  );
  professional.save(res);
};
