var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var utility = require('utility');

var QunSchema = new Schema({
  qid: { type: String, unique: true},
  name: { type: String},
  avatar: { type: String },
  bio: { type: String },
  location: {type: String},
  topic_count: { type: Number, default: 0 },
  creator_id: { type: String },
  admin_ids: [Schema.Types.String],
  members: [Schema.Types.String],
  create_at: { type: Date, default: Date.now }
});

QunSchema.plugin(BaseModel);
QunSchema.index({create_at: -1});
QunSchema.virtual('avatar_url').get(function () {
  var url = this.avatar || ('//cdn.v2ex.co/gravatar/' + utility.md5(this.qid) + '?d=retro');

  return url;
});

mongoose.model('Qun', QunSchema);