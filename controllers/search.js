const axios = require('axios');

exports.getIndex = (req, res, next) => {
  res.render('index');
};

exports.getSearch = (req, res, next) => {
  let searchTerm = req.query.title;
  axios({
    method: "GET",
    url: "https://www.googleapis.com/books/v1/volumes",
    params: {
      q: searchTerm,
      key: process.env.KEY,
      startIndex: 0,
      maxResults: 5,
    }
  }).then((response) => {
      const items = response.data.totalItems;
      const bookResults = response.data.items;

      res.render('results', {
        searchTerm,
        items,
        bookResults,
      })
    }).catch((err) => {
      console.log(err);
      console.log('failed');
      res.redirect('/');
    });
  };