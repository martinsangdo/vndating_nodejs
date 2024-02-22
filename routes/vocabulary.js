var express = require("express");
var router = express.Router();
const Common = require("../common/common");
const common = new Common();
const Vocabulary = require("../models/Vocabulary");

const request = require('request');

//
router.get("/load_next", function (req, res, next) {
    var vocabularyDb = new Vocabulary();
    vocabularyDb.countDoc({is_read: {$ne: true}}, (total) => {
        if (total > 0) {
            var _skip = Math.floor(Math.random() * total);
            console.log(_skip);

            vocabularyDb.findIt({is_read: {$ne: true}}, '', _skip, (doc) => {
                if (!doc) {
                    res.respondSuccess(message = "Failed", result = doc);
                }
                res.respondSuccess(result = doc);
            });
        } else {
            //no more doc
            res.respondSuccess(result = total);
        }
    });
});

//======
module.exports = router;
