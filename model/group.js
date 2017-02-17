var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var utility = require('utility');

var GroupSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    bio: {
        type: String
    },
    parent_id: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    }
});

GroupSchema.plugin(BaseModel);
GroupSchema.index({
    create_at: -1
});
GroupSchema.virtual('avatar_url').get(function() {
    var url = this.avatar || ('//cdn.v2ex.co/gravatar/' + utility.md5(this.id) + '?d=retro');

    return url;
});

mongoose.model('Group', GroupSchema);