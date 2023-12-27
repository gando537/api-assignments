var express = require('express');
var router = express.Router();
let User = require('../model/User');

// CREATES A NEW USER
// function createNewUser(req, res) {
//     User.create({
//             name : req.body.name,
//             email : req.body.email,
//             password : req.body.password,
//             role : req.body.role ? req.body.role : "user"
//         },
//         function (err, user) {
//             if (err) return res.status(500).send("There was a problem adding the information to the database.");
//             res.status(200).send(user);
//         });
// }

// // RETURNS ALL THE USERS IN THE DATABASE
// function getUsers(req, res) {
//     User.find({}, (err, users) => {
//         if (err){
//             res.status(500).send("There was a problem finding the users.");
//         }
//         res.status(200).send(users);
//     });
// }

// // GETS A SINGLE USER FROM THE DATABASE
// function getUser(req, res) {
//     return User.findById(req.params.id, function (err, user) {
//         if (err) return res.status(500).send("There was a problem finding the user.");
//         if (!user) return res.status(404).send("No user found.");
//         res.status(200).send(user);
//     });
// }

// // DELETES A USER FROM THE DATABASE
// function deleteUser(req, res) {
//     User.findByIdAndRemove(req.params.id, function (err, user) {
//         if (err) return res.status(500).send("There was a problem deleting the user.");
//         res.status(200).send("User: "+ user.name +" was deleted.");
//     });
// }

// // UPDATES A SINGLE USER IN THE DATABASE
// // function updateUser(req, res) {
// //     console.log("UPDATE recu user : ");
// //     console.log(req.body);
// //     User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
// //         if (err) return res.status(500).send("There was a problem updating the user.");
// //         res.status(200).send(user);
// //     });
// // }

// function postUser(req, res) {
//     let user = new User();
//     user.name = req.body.name;
//     user.email = req.body.email;
//     user.password = req.body.password;
//     user.role = req.body.role ? req.body.role : "user";
//     console.log("POST user reçu :");
//     console.log(user)

//     user.save( (err) => {
//         if(err){
//             res.send('cant post user ', err);
//         }
//         res.json({ message: `${user.name} saved!`})
//     })
// }

// // Update d'un assignment (PUT)
// function updateUser(req, res) {
//     console.log("UPDATE recu user : ");
//     console.log(req.body);
//     User.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, user) => {
//         if (err) {
//             console.log(err);
//             res.send(err)
//         } else {
//           res.json({message: 'updated'})
//         }

//       // console.log('updated ', assignment)
//     });
// }

// module.exports = { createNewUser, getUsers, getUser, deleteUser, updateUser, postUser };

// CREATES A NEW USER
router.post('/users/add', function (req, res) {
    console.log("POST user reçu :");
    console.log(req.body);
    User.create({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password,
            role : req.body.role ? req.body.role : "user"
        },
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
    console.log("POST user reçu :");
    console.log(req.body);
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/users/:id', function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});

// DELETES A USER FROM THE DATABASE
router.delete('/users/delete/:id', function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.status(200).send("User: "+ user.name +" was deleted.");
    });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/users/update/:id', function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
        if (err) return res.status(500).send("There was a problem updating the user.");
        res.status(200).send(user);
    });
});


module.exports = router;