//grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Constant = require("../common/constant.js");

// create a schema
var vocabularySchema = new Schema({
    tab: String,
    col: String,
    row: String,
    vi: String,
    en: String
}, { collection: 'vocabulary' });

// the schema is useless so far
// we need to create a model using it
var Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

Vocabulary.prototype.findOne = function (condition, fields, resp_func) {
    Vocabulary.findOne(condition)
        .select(fields)
        .exec(function (err, res) {
            if (err) {
                var resp = {
                    result: Constant.FAILED_CODE,
                    message: Constant.SERVER_ERR,
                    name: err.name,
                    kind: err.kind,
                };
                resp_func(resp);
            } else {
                var resp = {
                    result: Constant.OK_CODE,
                    data: res,
                };
                resp_func(resp);
            }
        });
};

// make this available to our users in our Node applications
module.exports = Vocabulary;
