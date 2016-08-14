var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

/*
 * type:
 *
 * reply           xx 回复了你的话题
 * at_topic      xx 在话题中提到了你
 * at_reply     xx 在话题中回复了你
 * apply          xx 请求加入 xx
 * apply_ok    xx 申请加入 xx 的请求通过
 * apply_no    xx 申请加入 xx 的请求被拒绝
 */

var MessageSchema = new Schema({
  type: { type: String },
  receiver_id: { type: String},
  sender_id: { type: String },
  qun_id: { type: String },
  topic_id: { type: ObjectId },
  reply_id: { type: ObjectId },
  has_read: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});
MessageSchema.plugin(BaseModel);


mongoose.model('Message', MessageSchema);
