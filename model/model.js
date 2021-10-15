var mongoose = require("mongoose");

var restaurants = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imgurl: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longtitude: {
    type: String,
    required: true,
  },
  hours: {
    type: String,
    required: true,
  },
});

var restos = mongoose.model("Restaurants", restaurants);
module.exports = restos;
