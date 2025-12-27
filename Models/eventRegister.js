const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  comments: {
    type: String
  },

  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  'EventRegistration',
  eventRegistrationSchema
);
