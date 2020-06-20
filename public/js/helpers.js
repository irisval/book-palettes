//handlebars helpers
let helpers = {
  resultsNewRow: function(index) {
    return index % 5 == 0;
  },

  resultsEndRow: function(index, len) {
    return (index + 1) % 5 == 0 || (index + 1) == len;
  }
}

module.exports = helpers;