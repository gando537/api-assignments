let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CountersSchema = Schema({
    _id: String,
    sequence_value: Number
    });
mongoose.model('Counters', CountersSchema);
module.exports = mongoose.model('Counters');