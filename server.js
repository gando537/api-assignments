let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let assignment = require('./routes/assignments');
let AuthController = require('./auth/AuthController');
let Eleve = require('./eleves_matieres/eleveController');
let Matiere = require('./eleves_matieres/matiereController');
let image = require('./utils/images');

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.set('debug', true);

// remplacer toute cette chaine par l'URI de connexion à votre propre base dans le cloud s
const uri = 'mongodb+srv://gandohd:cdatltrnwbrTGCP9@cluster1.dupmfaf.mongodb.net/db-angular-project?retryWrites=true&w=majority';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify:false
};

mongoose.connect(uri, options)
  .then(() => {
    console.log("Connecté à la base MongoDB assignments dans le cloud !");
    console.log("at URI = " + uri);
    console.log("vérifiez with http://localhost:8010/api/db-angular-project que cela fonctionne")
    },
    err => {
      console.log('Erreur de connexion: ', err);
    });

// Pour accepter les connexions cross-domain (CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// les routes
const prefix = '/api';

// Pour les formulaires
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// var UserController = require('./routes/UserController');
// app.use(prefix+'/db-angular-project', UserController);
app.use(prefix + '/db-angular-project', AuthController);
app.use(prefix + '/db-angular-project', Eleve);
app.use(prefix + '/db-angular-project', Matiere);
app.use(prefix + '/db-angular-project', image);

let port = process.env.PORT || 8010;

app.route(prefix + '/db-angular-project')
  .get(assignment.getAssignments);

app.route(prefix + '/db-angular-project/:id')
  .get(assignment.getAssignment)
  .delete(assignment.deleteAssignment);

// app.route(prefix + '/db-angular-project')
//   .post(assignment.postAssignment)
//   .put(assignment.updateAssignment);

app.route(prefix + '/db-angular-project')
  .post(assignment.postAssignment)
  .put(assignment.updateAssignmentByName);

// app.route(prefix + '/db-angular-project/users')
//   .get(user.getUsers);

// app.route(prefix + '/db-angular-project/users/:id')
//   .get(user.getUser)
//   .delete(user.deleteUser);

// app.route(prefix + '/db-angular-project/users').post(user.postUser)
//   .put(user.updateUser);

// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;
