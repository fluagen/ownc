var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var utility = require('utility');

var QunSchema = new Schema({
    id: {
        type: String,
        unique: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    bio: {
        type: String
    },
    location: {
        type: String
    },
    topic_count: {
        type: Number,
        default: 0
    },
    members: [{
        id: {
            type: String
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        type: {
            type: Number,
            default: 2
        } // 0 创建者、1 管理员、2普通成员
    }],
    creator_id: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

QunSchema.plugin(BaseModel);
QunSchema.index({
    create_at: -1
});
QunSchema.virtual('avatar_url').get(function() {
    var url = this.avatar || ('//cdn.v2ex.co/gravatar/' + utility.md5(this.id) + '?d=retro');

    return url;
});

mongoose.model('Qun', QunSchema);