var model = require('../model');
var Message = model.Message;

exports.getMessagesByReceiverId = function(receiverId, callback){
	Message.find({receiver_id: receiverId}, null, {sort: '-create_at'}, callback);
};