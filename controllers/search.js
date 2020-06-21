const axios = require('axios');
const Vibrant = require('node-vibrant')

exports.getIndex = (req, res, next) => {
  res.render('index');
};


const addColors = async (bookResults) => {
  const proms = bookResults.map((book) => {
    let colors = [];
    let m = Vibrant.from(book.volumeInfo.imageLinks.thumbnail).getSwatches().then((swatch) => {
      colors.push({"rgb": swatch.Vibrant.getRgb(), "hex": swatch.Vibrant.getHex()});
      colors.push({"rgb": swatch.Muted.getRgb(), "hex": swatch.Muted.getHex()});
      colors.push({"rgb": swatch.DarkVibrant.getRgb(), "hex": swatch.DarkVibrant.getHex()});
      colors.push({"rgb": swatch.DarkMuted.getRgb(), "hex": swatch.DarkMuted.getHex()});
      colors.push({"rgb": swatch.LightVibrant.getRgb(), "hex": swatch.LightVibrant.getHex()});
      colors.push({"rgb": swatch.LightMuted.getRgb(), "hex": swatch.LightMuted.getHex()});
      book.colors = colors;
      return book;
    }).catch((err) => console.log(err)); 
    return m;
  });

  return await Promise.all(proms);
}

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
    const bookResults = addColors(response.data.items);
    console.log(bookResults[0]);
    return bookResults;
  })
  .then((bookResults) => {

    res.render('results', {
      searchTerm,
      bookResults,
    })
  }).catch((err) => {
    console.log(err);
    console.log('failed');
    res.redirect('/');
  });
};