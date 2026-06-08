// STUGUIDE X - Company Model
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    unique: true
  },
  website: String,
  industry: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', CompanySchema);
