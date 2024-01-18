let Assignment = require('../model/assignment');
const Eleve = require('../model/eleve');
const Matiere = require('../model/matiere');

let lastInsertedId = 0; // Variable globale pour stocker la dernière ID ajoutée

async function getAssignments(req, res) {
    try {
        const searchTerm = req.query.search;

        // Commencez par les jointures
        let aggregateQuery = [
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
        ];

        // Ajout d'une étape de filtrage si un terme de recherche est fourni
        if (searchTerm) {
            const searchRegex = new RegExp(searchTerm, 'i'); // Expression régulière pour la recherche insensible à la casse
            aggregateQuery.push({
                $match: {
                    $or: [
                        { nom: searchRegex },
                        { 'eleve.nom': searchRegex },
                        { 'matiere.nom_matiere': searchRegex },
                    ]
                }
            });
        }

        // Ajoutez la projection à la fin
        aggregateQuery.push({
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
        });

        // Suite de votre logique de pagination
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        // Vérifier si la page est spécifiée dans la requête
        if (req.query.page === 'all') {
            page = 1;
            limit = await Assignment.countDocuments();
        }

        const aggregate = Assignment.aggregate(aggregateQuery);
        const options = { page, limit };

        await Assignment.aggregatePaginate(aggregate, options)
            .then(results => {
                res.status(200).json(results);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des assignments:', error);
                res.status(500).json({ message: 'Erreur serveur' });
            });
    } catch (error) {
        console.error('Erreur lors de la récupération des assignments:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

// Récupérer un assignment par son id (GET)
// function getAssignment(req, res) {
//     let assignmentId = req.params.id;

//     Assignment.findOne({ id: assignmentId }, (err, assignment) => {
//         if (err) { res.send(err) }
//         res.json(assignment);
//     });
// }

function getAssignment(req, res) {
    let assignmentId = req.params.id;

    // Création de la requête d'agrégation
    Assignment.aggregate([
        {
            $match: { id: parseInt(assignmentId) } // Assurez-vous que l'id est un entier si c'est le cas
        },
        {
            $lookup: {
                from: 'eleves',
                localField: '_idEleve',
                foreignField: '_id',
                as: 'eleve'
            }
        },
        {
            $unwind: {
                path: '$eleve',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'matieres',
                localField: '_idMatiere',
                foreignField: '_id',
                as: 'matiere'
            }
        },
        {
            $unwind: {
                path: '$matiere',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                // Incluez ici les champs que vous souhaitez dans le document final
                _id: 0,
                id: 1,
                nom: 1,
                dateDeRendu: 1,
                rendu: 1,
                note: 1,
                auteur: {
                    $concat: ["$eleve.prenom", " ", "$eleve.nom"]
                },
                remarquesEleve: '$eleve.remarques',
                matiere: {
                    nom_matiere: '$matiere.nom_matiere',
                    image_matiere: '$matiere.image_matiere',
                    image_prof: '$matiere.image_prof',
                },
                // autres champs que vous souhaitez inclure
            }
        }
    ]).then(result => {
        // Le résultat est un tableau, donc prenez le premier élément
        res.json(result[0]);
    }).catch(err => {
        console.error('Erreur lors de la récupération de l\'assignment:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    });
}


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
        modification = { $set: { nom: req.body.nom } };
    }
    if (req.body.dateDeRendu) {
        modification = { $set: { dateDeRendu: req.body.dateDeRendu } };
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
