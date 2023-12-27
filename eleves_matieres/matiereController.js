var express = require('express');
var router = express();
let Matiere = require('../model/matiere');
let Image = require('../model/image');

// CREATES A NEW matiere
router.post('/matieres/add', async function (req, res) {
    console.log("POST matiere reçu :");
    console.log(req.body);
    const nom_matiere = req.body.nom_matiere;
    const img = await Image.findOne({ description: nom_matiere });
    const image_matiere = img ? img.imagePath : null;
    Matiere.create({
            id : req.body.id,
            nom_matiere : nom_matiere,
            image_prof : req.body.image_prof,
            image_matiere : image_matiere
        },
        function (err, matiere) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(matiere);
        });
});

// RETURNS ALL THE matieres IN THE DATABASE
router.get('/matieres', function (req, res) {
    Matiere.find({}, function (err, matieres) {
        if (err) return res.status(500).send("There was a problem finding the matieres.");
        res.status(200).send(matieres);
    });
});

// GETS A SINGLE matiere FROM THE DATABASE with name
router.get('/matieres/name=:nom_matiere', function (req, res) {
    let matiereName = req.params.nom_matiere;
    Matiere.findOne({nom_matiere : matiereName}, function (err, matiere) {
        if (err) return res.status(500).send("There was a problem finding the matiere.");
        if (!matiere) return res.status(404).send("No matiere found.");
        res.status(200).send(matiere);
    });
});

// GETS A SINGLE matiere FROM THE DATABASE with id
router.get('/matieres/:id', function (req, res) {
    let matiereId = req.params.id;
    Matiere.findOne({id: matiereId}, (err, matiere) =>{
        if(err){res.send(err)}
        res.json(matiere);
    })
});



// DELETES A matiere FROM THE DATABASE
// router.delete('/matieres/delete/:name', function (req, res) {
//     matiere.findByNameAndRemove(req.params.id, function (err, matiere) {
//         if (err) return res.status(500).send("There was a problem deleting the matiere.");
//         res.status(200).send("matiere: "+ matiere.name +" was deleted.");
//     });
// });

// // UPDATES A SINGLE matiere IN THE DATABASE
// router.put('/matieres/update/:id', function (req, res) {
//     matiere.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, matiere) {
//         if (err) return res.status(500).send("There was a problem updating the matiere.");
//         res.status(200).send(matiere);
//     });
// });


module.exports = router;