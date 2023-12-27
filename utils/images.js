const express = require('express');
const app = express();
const Image = require('../model/image');
const Matiere = require('../model/matiere');

const path = require('path');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets'); // Répertoire de stockage des images sur le serveur
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// GETS A SINGLE Image FROM THE DATABASE with name
app.get('/image', async (req, res) => {
    console.log("GET image reçu :");
    let imagePath = req.query.imagePath;
    // await Image.findOne({imagePath : imagePath}, async (err, desc) =>{
    //     if (err) return res.status(500).send("There was a problem finding the image.");
    //     if (!desc) return res.status(404).send("No image found.");
    //     res.status(200).send(desc);
    // });
    // Construire le chemin complet vers l'image

    // Renvoyer le lien vers l'image
    res.status(200).json({ imageUrl: `${imagePath}` });
});

const upload = multer({ storage: storage });

// Route POST pour télécharger une image
app.post('/images/add', upload.single('image'), async (req, res) => {
    try {
        const description = req.body.description;
        const imagePath = req.file.path; // Chemin d'accès vers l'image dans le système de fichiers
        // Enregistrez la référence de l'image dans la base de données
        const newImage = new Image({ description, imagePath });
        await newImage.save();
        Matiere.findOneAndUpdate({nom_matiere : description}, {image_matiere : imagePath}, (err, matiere) =>{
            if(err){res.send(err)}
            res.json(matiere);
        });
        res.status(201).json({ message: 'Image téléchargée avec succès' });
    } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route GET pour récupérer toutes les images
app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch (error) {
        console.error('Erreur lors de la récupération des images:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route GET pour récupérer une image
app.get('/images/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        res.status(200).json(image);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'image:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = app;