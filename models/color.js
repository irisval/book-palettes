const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const colorSchema = new Schema({
  rgb: {
    type: String,
    required: true
  },
  hex: {
    type: String,
    required: true
  },
  hsl: {
    type: String,
    required: true
  },
  books: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Book'
    }
  ]


});

module.exports = mongoose.model('Color', colorSchema);