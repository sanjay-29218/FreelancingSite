const mongoose = require('mongoose');
const mongooseAlgolia = require('mongoose-algolia');
const Schema = mongoose.Schema;
const config = require('../config/secret');

const ProfileSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  Emailaddress  : String,
  PhoneNumber: String,
  Age: Number,
  picture: {
    type: String
  },
  DOB: String,
  AboutYou: String,
  created: {
    type: Date,
    default: Date.now
  },
});


let Model = mongoose.model('Profile', ProfileSchema);

module.exports = Model;