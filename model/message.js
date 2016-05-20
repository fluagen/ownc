var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

/*
 * type:
 * reply: xx 回复了你的话题
 * reply2: xx 在话题中回复了你
 * at: xx ＠了你
 */

var MessageSchema = new Schema({
  type: { type: String },
  receiver_id: { type: ObjectId},
  sender_id: { type: ObjectId },
  group_id: { type: ObjectId },
  topic_id: { type: ObjectId },
  reply_id: { type: ObjectId },
  has_read: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});
MessageSchema.plugin(BaseModel);


mongoose.model('Message', MessageSchema);
