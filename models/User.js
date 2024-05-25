const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  phoneNumber: String,
  password: { type: String, required: true },
  role: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
