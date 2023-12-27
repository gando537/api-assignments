let Assignment = require('../model/assignment');
const Eleve = require('../model/eleve');
const Matiere = require('../model/matiere');

let lastInsertedId = 0; // Variable globale pour stocker la dernière ID ajoutée

// Récupérer tous les assignments (GET)
// function getAssignments(req, res) {
//     var aggregateQuery = Assignment.aggregate();
//     Assignment.aggregatePaginate(aggregateQuery,
//         {
//             page: parseInt(req.query.page) || 1,
//             limit: parseInt(req.query.limit) || 10,
//         },
//         (err, assignments) => {
//             if (err) {
//                 res.send(err);
//             }

//             res.send(assignments);
//         }
//     );
// }


// Route GET pour récupérer les données des assignments avec les données des élèves et des matières associées
async function getAssignments(req, res) {
    try {
        var aggregateQuery = Assignment.aggregate([
            {
                $lookup: {
                    from: 'eleves',
                    localField: '_idEleve',
                    foreignField: '_id',
                    as: 'eleve',
                },
            },
            {
                $unwind: '$eleve',
            },
            {
                $lookup: {
                    from: 'matieres',
                    localField: '_idMatiere',
                    foreignField: '_id',
                    as: 'matiere',
                },
            },
            {
                $unwind: '$matiere',
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    nom: 1,
                    dateDeRendu: 1,
                    rendu: 1,
                    note: 1,
                    auteur: '$eleve.nom',
                    remarques: '$eleve.remarques',
                    matiere: {
                        nom_matiere: '$matiere.nom_matiere',
                        image_matiere: '$matiere.image_matiere',
                        image_prof: '$matiere.image_prof',
                    },
                },
            },
        ]);

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        // Vérifier si la page est spécifiée dans la requête
        if (req.query.page === 'all') {
            page = 1;
            limit = await Assignment.countDocuments();
        }

        const assignments = await Assignment.aggregatePaginate(aggregateQuery, { page, limit });
        res.status(200).json(assignments);

    } catch (error) {
        console.error('Erreur lors de la récupération des assignments:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res) {
    let assignmentId = req.params.id;

    Assignment.findOne({ id: assignmentId }, (err, assignment) => {
        if (err) { res.send(err) }
        res.json(assignment);
    })
}

// Ajout d'un assignment (POST)
// function postAssignment(req, res){
//     let assignment = new Assignment();
//     assignment.id = req.body.id;
//     assignment.nom = req.body.nom;
//     assignment.dateDeRendu = req.body.dateDeRendu;
//     assignment.rendu = req.body.rendu;

//     console.log("POST assignment reçu :");
//     console.log(assignment)

//     assignment.save( (err) => {
//         if(err){
//             res.send('cant post assignment ', err);
//         }
//         res.json({ message: `${assignment.nom} saved!`})
//     })
// }

async function postAssignment(req, res) {
    try {
        let assignment = new Assignment();
        assignment.id = req.body.id;
        assignment.nom = req.body.nom;
        assignment.dateDeRendu = req.body.dateDeRendu;
        assignment.rendu = req.body.rendu;
        assignment.note = req.body.note;

        // Obtenez la liste des élèves depuis la collection "eleves"
        const eleves = await Eleve.find({});
        const matiere_nom = req.body.matiere.nom_matiere;
        const matiere = await Matiere.findOne({ nom_matiere: matiere_nom });

        // Ajoutez un document d'assignment pour chaque élève
        const assignmentsPromises = eleves.map(async (eleve) => {
            if (eleve && eleve._id) {
                let random = RandomBoolean();
                const assignmentForEleve = {
                    _idEleve: eleve._id, // Utilisez l'ID de l'élève comme clé étrangère
                    _idMatiere: matiere._id, // Utilisez l'ID de la matière comme clé étrangère
                    id: lastInsertedId + 1,
                    nom: assignment.nom,
                    dateDeRendu: assignment.dateDeRendu,
                    rendu: random,
                    note: random == true ? Math.floor(Math.random() * 20) : null
                };

                lastInsertedId = assignmentForEleve.id;

                // Ajoutez le document d'assignment à la collection "assignments"
                await Assignment.create(assignmentForEleve);
            } else {
                console.error('Eleve non défini ou sans _id');
            }
        });

        await Promise.all(assignmentsPromises);

        res.status(201).json({ message: 'Assignments ajoutés avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout des assignments:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);
    Assignment.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, assignment) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.json({ message: 'updated' })
        }

        // console.log('updated ', assignment)
    });
}

function updateAssignmentByName(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);

    const critereRecherche = { nom: req.body._id };
    let modification = {};
    if (req.body.nom) {
        modification = {$set: {nom: req.body.nom}};
    }
    if (req.body.dateDeRendu) {
        modification = {$set: {dateDeRendu: req.body.dateDeRendu}};
    }
    console.log(modification);
    Assignment.updateMany(critereRecherche, modification, { new: true }, (err, assignment) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.json({ message: 'updated' })
        }

        // console.log('updated ', assignment)
    });
}

// suppression d'un assignment (DELETE)
function deleteAssignment(req, res) {

    Assignment.findByIdAndRemove(req.params.id, (err, assignment) => {
        if (err) {
            res.send(err);
        }
        res.json({ message: `${assignment.nom} deleted` });
    })
}

function RandomBoolean() {
    let random = Math.floor(Math.random() * 2);
    return random == 1 ? true : false;
}


module.exports = { getAssignments, postAssignment, getAssignment, updateAssignment, deleteAssignment, updateAssignmentByName };
