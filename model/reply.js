var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ReplySchema = new Schema({
  content: { type: String },
  topic_id: { type: ObjectId},
  author_id: { type: String },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  ups: [Schema.Types.String]
});

ReplySchema.plugin(BaseModel);

mongoose.model('Reply', ReplySchema);
