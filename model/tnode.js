var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;

var TNodeSchema = new Schema({
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
    },
});

TNodeSchema.plugin(BaseModel);

mongoose.model('TNode', TNodeSchema);