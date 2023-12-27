let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const imageSchema = Schema({
    description: String,
    imagePath: String, // Chemin d'accès ou URL vers l'image dans le système de fichiers
});
mongoose.model('Images', imageSchema);
module.exports = mongoose.model('Images');