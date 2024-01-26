let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CountersSchema = Schema({
    _id: String,
    seq: Number
    });
mongoose.model('Counters', CountersSchema);
module.exports = mongoose.model('Counters');