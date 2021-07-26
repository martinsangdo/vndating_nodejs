/**
 * author: Martin
 * save fb post id which user commented
 */
//grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Constant = require('../common/constant.js');

//define format of Collection
var FBPostSchema = new Schema({
    fb_post_id           :   {type: String, trim: true},
    create_time     :   {type: Date}
}, { collection: 'FBPost' });

//the schema is useless so far
//we need to create a model using it
var FBPost = mongoose.model('FBPost', FBPostSchema);

//create new document
FBPost.prototype.create = function(data, resp_func){
    var doc = new FBPost(data);
    doc.save(function(err, result){
        if(err) {
            var resp = {
                result : Constant.FAILED_CODE,
                message: Constant.SERVER_ERR,
                err: err
            };
            resp_func(resp);
        }else{
            var resp = { result : Constant.OK_CODE };
            resp_func(resp);
        }
    });
};
//


module.exports = FBPost;
