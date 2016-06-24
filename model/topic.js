var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var TopicSchema = new Schema({
  title: { type: String },
  content: { type: String },
  author_id: { type: ObjectId },
  group_id: {type: ObjectId},
  top: { type: Boolean, default: false }, // 置顶帖
  good: {type: Boolean, default: false}, // 精华帖
  lock: {type: Boolean, default: false}, // 被锁定主题
  private: {type: Boolean, default: false}, // 私有的
  deleted: {type: Boolean, default: false},
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  ups: [Schema.Types.ObjectId],
  downs: [Schema.Types.ObjectId],
  
  reply_count: { type: Number, default: 0 },
  visit_count: { type: Number, default: 0 },
  collect_count: { type: Number, default: 0 },
  follow_count: { type: Number, default: 0 },
 
  last_reply: { type: ObjectId },
  last_reply_author_loginid: {type: String},
  last_reply_at: { type: Date, default: Date.now }
});

TopicSchema.plugin(BaseModel);
TopicSchema.index({create_at: -1});
TopicSchema.index({top: -1, last_reply_at: -1});
TopicSchema.index({author_id: 1, create_at: -1});


mongoose.model('Topic', TopicSchema);
