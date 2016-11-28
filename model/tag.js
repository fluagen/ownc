var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;

var TagSchema = new Schema({
    id: {
        type: String
    },
    bio: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    },
});

TagSchema.plugin(BaseModel);

mongoose.model('Tag', TagSchema);