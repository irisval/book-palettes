const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const colorSchema = new Schema({
  rgb: {
    type: String,
    required: true,
    unique: true
  },
  hex: {
    type: String,
    required: true,
    unique: true
  },
  hsl: {
    type: String,
    required: true,
    unique: true
  },
  books: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    }
  ]
});

module.exports = mongoose.model('Color', colorSchema);