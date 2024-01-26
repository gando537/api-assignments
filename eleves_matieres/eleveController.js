var express = require('express');
var router = express.Router();
let Eleve = require('../model/eleve');

// CREATES A NEW eleve
router.post('/eleves/add', function (req, res) {
    console.log("POST eleve reçu :");
    console.log(req.body);
    Eleve.create({
            id : req.body.id,
            nom : req.body.nom,
            prenom : req.body.prenom,
            email : req.body.email,
            img : req.body.img
        },
        function (err, eleve) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(eleve);
        });
});

// RETURNS ALL THE eleveS IN THE DATABASE
router.get('/eleves', function (req, res) {
    Eleve.find({}, function (err, eleves) {
        if (err) return res.status(500).send("There was a problem finding the eleves.");
        res.status(200).send(eleves);
    });
});

// GETS A SINGLE eleve FROM THE DATABASE with name
router.get('/eleves/name=:nom', function (req, res) {
    let eleveName = req.params.nom;
    Eleve.findOne({nom : eleveName}, function (err, eleve) {
        if (err) return res.status(500).send("There was a problem finding the eleve.");
        if (!eleve) return res.status(404).send("No eleve found.");
        res.status(200).send(eleve);
    });
});

// GETS A SINGLE eleve FROM THE DATABASE with id
router.get('/eleves/:id', function (req, res) {
    let eleveId = req.params.id;
    Eleve.findOne({id: eleveId}, (err, eleve) =>{
        if(err){res.send(err)}
        res.json(eleve);
    })
});

module.exports = router;