let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let EleveSchema = Schema({
  id: Number,
  nom: String,
  prenom: String,
  email: String,
  img: String
});
mongoose.model('Eleves', EleveSchema);
module.exports = mongoose.model('Eleves');