const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  isbn10: {
    type: String,
    unique: true
  },
  isbn13: {
    type: String,
    unique: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  authors: [
    {
      type: String,
      required: true
    }
  ],
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