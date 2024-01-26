let mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let Schema = mongoose.Schema;

let AssignmentSchema = Schema({
    id: Number,
    _idEleve: Schema.Types.ObjectId,
    _idMatiere: Schema.Types.ObjectId,
    dateDeRendu: Date,
    nom: String,
    rendu: Boolean,
    auteur:String,
    note:Number,
    remarques:String,
    matiere: [
      { nom_matiere : String },
      { image_matiere : String },
      { image_prof : String }
    ]
});
AssignmentSchema.plugin(aggregatePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model('Assignment', AssignmentSchema);
