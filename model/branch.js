const mongoose = require('mongoose');
const { isEmail } = require('validator');

const Schema = mongoose.Schema;

const BranchSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  address: {
    type: String,
    required: true,
    maxlength: 200,
  },
  email: {
    type: String,
    validate: [ isEmail, 'Invalid Email'],
  },
  telephone: {
    type: String,
    required: true,
  },
  itemInStock: [{
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },
    number: {
      type: Number,
      min: 0,
    }
  }],
});

BranchSchema.virtual('url').get(function() {
  return `/branch/${this._id}`
});

module.exports = mongoose.model('Branch', BranchSchema);