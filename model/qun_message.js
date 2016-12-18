var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var QunMessageSchema = new Schema({
  applicant_id: { type: ObjectId },
  qun_id: { type: String},
  content: { type: String},
  type: { type: String },
  create_at: { type: Date, default: Date.now }
});
QunMessageSchema.plugin(BaseModel);


mongoose.model('QunMessage', QunMessageSchema);
