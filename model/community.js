var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var CommunitySchema = new Schema({
  name: { type: String},
  avatar: { type: String },
  bio: { type: String },
  location: {type: String},
  topic_count: { type: Number, default: 0 },
  creator_id: { type: ObjectId },
  admin_ids: [Schema.Types.ObjectId],
  members: [Schema.Types.ObjectId],
  create_at: { type: Date, default: Date.now },
  groups: [{
    id: {type: String},
    name: {type: String},
    bio: { type: String },
    creator_id: { type: ObjectId },
    members: [Schema.Types.ObjectId],
    topic_count: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now }
   }]
});

CommunitySchema.plugin(BaseModel);
CommunitySchema.index({create_at: -1});

mongoose.model('Community', CommunitySchema);