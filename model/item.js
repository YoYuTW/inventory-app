const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 200,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  price: {
    type: Number,
    min: 0,
  },
});

ItemSchema.virtual('url').get(function() {
  return `/categories/items/${this._id}`
});

module.exports = mongoose.model('Item', ItemSchema);