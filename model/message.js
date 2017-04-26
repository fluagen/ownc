var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var MessageSchema = new Schema({
  sender_id: { type: String },
  receiver_id: { type: String},
  topic_id: { type: ObjectId },
  reply_id: { type: ObjectId },
  type: { type: String },
  has_read: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});
MessageSchema.plugin(BaseModel);


mongoose.model('Message', MessageSchema);
