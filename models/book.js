const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  isbn10: {
    type: Number,
    unique: true
  },
  isbn13: {
    type: Number,
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
  // swatches: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: 'Color',
  //     required: true
  //   }
  // ]
});

module.exports = mongoose.model('Book', bookSchema);