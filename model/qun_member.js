var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var QunMemberSchema = new Schema({
  member_id: { type: ObjectId },
  qun_id: { type: ObjectId },
  type: {type: Number, default: 2}, // 0 创建者、1 管理员、2普通成员
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

QunMemberSchema.plugin(BaseModel);
mongoose.model('QunMember', QunMemberSchema);
