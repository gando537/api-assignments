let Assignment = require('../model/assignment');
const Eleve = require('../model/eleve');
const Matiere = require('../model/matiere');
const Counters = require('../model/Counters');

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
                    nom_prof: '$matiere.nom_prof',
                    prenom_prof: '$matiere.prenom_prof',
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
                    nom_prof: '$matiere.nom_prof',
                    prenom_prof: '$matiere.prenom_prof',
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

async function getUniqueAssignments(req, res) {
    try {
        const uniqueAssignments = await Assignment.aggregate([
            {
                $lookup: {
                    from: "matieres", // Nom de la collection Matiere
                    localField: "_idMatiere", // Champ de correspondance dans Assignment
                    foreignField: "_id", // Champ de correspondance dans Matiere
                    as: "matiere_info" // Le résultat de la jointure
                }
            },
            {
                $unwind: "$matiere_info" // Déconstruit le tableau de matieres
            },
            {
                $group: {
                    _id: "$nom",
                    dateDeRendu: { $first: "$dateDeRendu" }, // Prend la première dateDeRendu trouvée pour ce nom
                    image_matiere: { $first: "$matiere_info.image_matiere" }, // Prend la première image_matiere trouvée pour ce nom
                    image_prof: { $first: "$matiere_info.image_prof" }, // Prend la première image_prof trouvée pour ce nom
                    nom_matiere: { $first: "$matiere_info.nom_matiere" }, // Prend la première nom_matiere trouvée pour ce nom
                    nom_prof: { $first: "$matiere_info.nom_prof" }, // Prend la première nom_prof trouvée pour ce nom
                    prenom_prof: { $first: "$matiere_info.prenom_prof" }, // Prend la première prenom_prof trouvée pour ce nom
                }
            },
            {
                $project: {
                    _id: 0,
                    nom: "$_id",
                    dateDeRendu: 1, // Inclure dateDeRendu
                    image_prof: 1, // Inclure imageProf
                    image_matiere: 1, // Inclure imageMatiere
                    nom_matiere: 1, // Inclure nom_matiere
                    nom_prof: 1, // Inclure nom_prof
                    prenom_prof: 1, // Inclure prenom_prof
                }
            }
        ]);

        res.status(200).json(uniqueAssignments);
    } catch (error) {
        console.error('Erreur lors de la récupération des devoirs uniques:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

// Route pour supprimer tous les devoirs par nom
async function deleteByName(req, res){
    try {
        const nom = req.params.nom;
        await Assignment.deleteMany({ nom: nom });
        console.log('Tous les devoirs pour le nom ' + nom + ' ont été supprimés');
        res.status(200).json({ message: 'Tous les devoirs supprimés avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression des devoirs:', error);
        res.status(500).send('Erreur serveur');
    }
}


async function postAssignment(req, res) {
    try {

        let assignment = new Assignment();
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
                    id: await getNextSequence('assignmentId'),
                    nom: assignment.nom,
                    dateDeRendu: assignment.dateDeRendu,
                    rendu: random,
                    note: random == true ? Math.floor(Math.random() * 20) : null
                };

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

async function getNextSequence(name) {
    const counter = await Counters.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
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
    });
}

function updateAssignmentByName(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);

    const critereRecherche = { nom: req.body._id };
    let modification = {};
    if (req.body.nom && req.body.dateDeRendu) {
        modification = { $set: { nom: req.body.nom, dateDeRendu: req.body.dateDeRendu } };
    }
    else if (req.body.nom ) {
        modification = { $set: { nom: req.body.nom } };
    }
    else if (req.body.dateDeRendu) {
        modification = { $set: { dateDeRendu: req.body.dateDeRendu } };
    }
    else {
        res.status(500).json({ message: 'Erreur serveur' });
    }
    console.log(modification);
    Assignment.updateMany(critereRecherche, modification, { new: true }, (err, assignment) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            res.json({ message: 'updated' })
        }
    });
}

// suppression d'un assignment (DELETE)
function deleteAssignment(req, res) {

    console.log("ID reçu pour suppression:", req.params.id);
    Assignment.deleteOne({ id: req.params.id }, (err, assignment) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else if (!assignment) {
            res.status(404).json({ message: 'Assignment not found' });
        } else {
            console.log("Assignment supprimé :", assignment);
            res.json({ message: `${assignment.nom} deleted` });
        }
    })
}

function RandomBoolean() {
    let random = Math.floor(Math.random() * 2);
    return random == 1 ? true : false;
}


module.exports = { getAssignments, getUniqueAssignments, deleteByName, postAssignment, getAssignment, updateAssignment, deleteAssignment, updateAssignmentByName };
