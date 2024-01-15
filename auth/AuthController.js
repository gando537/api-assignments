var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../model/User');
var VerifyToken = require('./VerifyToken');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/users/register', function (req, res) {

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role ? req.body.role : "user"
    },
        function (err, user) {
            if (err) return res.status(500).send("There was a problem registering the user.")
            // create a token
            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 3600 // expires in 1 hour
            });
            res.status(200).send({ auth: true, token: token });
        });
});

router.get('/users/all', function (req, res) {
    User.find({}, function (err, users) {
        if (err) return res.status(500).send('Error on the server.');
        if (!users) return res.status(404).send('No user found.');
        if (err) return res.status(500).send("There was a problem finding the users.");

        users = users.map(user => {
            return {
                auth: false,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        res.status(200).send(users);
    });
});

router.get('/users', VerifyToken, function(req, res, next) {

    User.findById(req.userId, { password: 0 }, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("No user found.");

      res.status(200).send(user);
    });
});

// add the middleware function
router.use(function (user, req, res, next) {
    res.status(200).send(user);
});

router.post('/users/login', function (req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ auth: true, token: token, username: user.name, role: user.role });
    });
});

router.get('/users/logout', function(req, res) {
    res.status(200).send({ auth: false, token: null });
});

module.exports = router;