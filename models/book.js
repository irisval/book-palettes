const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  isbn10: {
    type: Number
  },
  isbn13: {
    type: Number
  },
  categories: [
    {
      type: String
    }
  ],
  swatches: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Color',
      required: true
    }
  ]
});

module.exports = mongoose.model('Book', bookSchema);