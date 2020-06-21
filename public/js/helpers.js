//handlebars helpers
let helpers = {
  loop: function(n, block) {
    let acc = "";

    for (let i = 0; i < n; i++) {
      acc += block.fn(i);
    }

    return acc;
  },

  resultsNewRow: function(index) {
    return index % 4 == 0;
  },

  resultsEndRow: function(index, len) {
    return (index + 1) % 4 == 0 || (index + 1) == len;
  },

  colFillRow: function(index) {
    return 3 - (index % 4);
  }
}

module.exports = helpers;