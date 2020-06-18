const rp = require('request-promise');

exports.getIndex = (req, res, next) => {
  res.render('index');
};

exports.getSearch = (req, res, next) => {
  console.log("you are here!");
  console.log("\n\n\n\n");
  const returnedBooks = {
      uri: 'https://www.googleapis.com/books/v1/volumes',
      qs: {
          q: req.query.title,
          // key: process.env.API_KEY 
      },
      headers: {
          'User-Agent': 'Request-Promise'
      },
      json: true
  };
  console.log("you are NOW here!");
  console.log("\n\n\n\n");

  rp(returnedBooks).then(function (data) {
      console.log(data);
      res.redirect('/');
    })
    .catch(function (err) {
      console.log(err);
      console.log('failed');
      res.redirect('/');
    });
  
};