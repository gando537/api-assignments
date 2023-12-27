let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = Schema({
  name: String,
  email: String,
  password: String,
  role: String
});
mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');