var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var InvitationSchema = new Schema({
  code: { type: String},
  qun_id: {type: String},
  create_at: { type: Date, default: Date.now }
});


mongoose.model('Invitation', InvitationSchema);