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
    en: String,
    is_read: Boolean
}, { collection: 'vocabulary' });

// the schema is useless so far
// we need to create a model using it
var Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

Vocabulary.prototype.findIt = function (condition, fields, _skip, resp_func) {
    Vocabulary.findOne(condition)
        .select(fields)
        .skip(_skip)
        .exec(function (err, res) {
            if (err) {
                var resp = {
                    result: Constant.FAILED_CODE,
                    message: Constant.SERVER_ERR,
                    name: err.name,
                    kind: err.kind
                };
                resp_func(resp);
            } else {
                var resp = {
                    result: Constant.OK_CODE,
                    data: res
                };
                resp_func(resp);
            }
        });
};
Vocabulary.prototype.countDoc = function (condition, resp_func) {
    Vocabulary.countDocuments(condition, function(err, total) {
        resp_func(total);
    });
};
//
Vocabulary.prototype.update = function(existed_condition, update_data, resp_func){
    var options = { upsert: false };
    Vocabulary.updateOne(existed_condition, update_data, options, function(err, numAffected){
        // numAffected is the number of updated documents
        if(err) {
            var resp = {
                result : Constant.FAILED_CODE,
                message: Constant.SERVER_ERR,
                err: err
            };
            resp_func(resp);
        }else{
            var resp = {
                result : Constant.OK_CODE
            };
            resp_func(resp);
        }
    });
};
// make this available to our users in our Node applications
module.exports = Vocabulary;
