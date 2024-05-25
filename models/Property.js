const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propertySchema = new Schema({
  title: String,
  description: String,
  address: String,
  area: Number,
  bedrooms: Number,
  bathrooms: Number,
  nearbyHospitals: String,
  nearbyColleges: String,
  price: Number,
  photos: String,
  contactInformation: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model('Property', propertySchema);
