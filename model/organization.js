var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var utility = require('utility');

var OrganizationSchema = new Schema({
  id: { type: String},
  name: { type: String},
  avatar: { type: String },
  bio: { type: String },
  location: {type: String},
  topic_count: { type: Number, default: 0 },
  creator_id: { type: String },
  admin_ids: [Schema.Types.String],
  members: [Schema.Types.String],
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

OrganizationSchema.plugin(BaseModel);
OrganizationSchema.index({create_at: -1});
OrganizationSchema.virtual('avatar_url').get(function () {
  var url = this.avatar || ('//cdn.v2ex.co/gravatar/' + utility.md5(this.id) + '?d=retro');

  return url;
});

mongoose.model('Organization', OrganizationSchema);