var express = require("express");
var router = express.Router();
const Common = require("../common/common");
const common = new Common();
const Vocabulary = require("../models/Vocabulary");

const request = require('request');

//
router.get("/load_next", function (req, res, next) {
    Vocabulary.findOne({is_read: {$ne: true}}, '', (err, doc) => {
        if (err || !doc) {
            res.respondSuccess(message = "Failed", result = doc);
        }
        res.respondSuccess(result = doc);
    });
});

//======
module.exports = router;
