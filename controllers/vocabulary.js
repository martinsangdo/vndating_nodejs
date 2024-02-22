var express = require("express");
var router = express.Router();
const Common = require("../common/common");
const common = new Common();
const Vocabulary = require("../models/Vocabulary");

exports.index = function(req, res){
    res.render('vocabulary', { title: 'Express' });
};

exports.load_next = (req, res) => {
    Vocabulary.findOne({is_read: {$ne: false}}, '', (err, doc) => {
        if (err || !doc) {
            return res.rest.success(
                "Cannot find the item"
            );
        }
        return res.rest.success(doc);
    });
};
