let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MatiereSchema = Schema({
    id: Number,
    nom_matiere : String,
    image_matiere : String,
    image_prof : String
});
mongoose.model('Matieres', MatiereSchema);
module.exports = mongoose.model('Matieres');