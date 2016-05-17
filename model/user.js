var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var UserSchema = new Schema({
  loginid: { type: String},
  name: { type: String},
  passwd: { type: String },
  email: { type: String},
  pagehome: { type: String },
  avatar: { type: String },
  signature: { type: String },

  topic_count: { type: Number, default: 0 },
  reply_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },

  active: {type: Boolean, default: true}
});

UserSchema.plugin(BaseModel);
UserSchema.index({create_at: -1});

mongoose.model('User', UserSchema);
