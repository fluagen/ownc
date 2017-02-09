var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;
var tools = require('../common/tools');

var TopicSchema = new Schema({
  title: { type: String },
  content: { type: String },
  author_id: { type: ObjectId },
  qun_id: { type: String },
  top: { type: Boolean, default: false }, // 置顶帖
  good: {type: Boolean, default: false}, // 精华帖
  lock: {type: Boolean, default: false}, // 被锁定主题
  opened: {type: Boolean, default: true}, // 公开的
  deleted: {type: Boolean, default: false},
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  
  reply_count: { type: Number, default: 0 },
  visit_count: { type: Number, default: 0 },
  collect_count: { type: Number, default: 0 },
  follow_count: { type: Number, default: 0 },
 
  last_reply_id: { type: ObjectId },
  last_reply_author: { type: ObjectId },
  last_reply_at: { type: Date, default: Date.now },

  group_id: { type: String }
});

TopicSchema.plugin(BaseModel);
TopicSchema.plugin(function (schema) {
  schema.methods.last_reply_at_ago = function () {
    return tools.formatDate(this.last_reply_at, true);
  };
  schema.methods.last_reply_at_fmt = function () {
    return tools.formatDate(this.last_reply_at, false);
  };
});
TopicSchema.index({create_at: -1});
TopicSchema.index({top: -1, last_reply_at: -1});
TopicSchema.index({author_id: 1, create_at: -1});


mongoose.model('Topic', TopicSchema);
