const axios = require('axios');
const Vibrant = require('node-vibrant')
const Book = require('../models/book');
const Color = require('../models/color');

exports.getIndex = (req, res, next) => {
  res.render('index');
};


let rgbToString = (rgb) => {
  return "rgb (" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"
}

let hslToString = (rgb) => {
  return "rgb (" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"
}

// const addColors = async (bookResults) => {
//   const proms = bookResults.filter((book) => book.volumeInfo.imageLinks?.thumbnail != undefined).map((book) => {
//       let colors = [];
//       let m = Vibrant.from(book.volumeInfo.imageLinks?.thumbnail).getSwatches().then((swatch) => {
//         colors.push({rgb: rgbToString(swatch.Vibrant.getRgb()), hex: swatch.Vibrant.getHex(), hsl: hslToString(swatch.Vibrant.getHsl())});
//         colors.push({rgb: rgbToString(swatch.Muted.getRgb()), hex: swatch.Muted.getHex(), hsl: hslToString(swatch.Muted.getHsl())});
//         colors.push({rgb: rgbToString(swatch.DarkVibrant.getRgb()), hex: swatch.DarkVibrant.getHex(), hsl: hslToString(swatch.DarkVibrant.getHsl())});
//         colors.push({rgb: rgbToString(swatch.DarkMuted.getRgb()), hex: swatch.DarkMuted.getHex(), hsl: hslToString(swatch.DarkMuted.getHsl())});
//         colors.push({rgb: rgbToString(swatch.LightVibrant.getRgb()), hex: swatch.LightVibrant.getHex(), hsl: hslToString(swatch.LightVibrant.getHsl())});
//         colors.push({rgb: rgbToString(swatch.LightMuted.getRgb()), hex: swatch.LightMuted.getHex(), hsl: hslToString(swatch.LightMuted.getHsl())});
//         return colors;
//       }).then((colors) => {
//           console.log(colors[0]);
//           Color.insertMany(colors);
//           return colors;
//       }).then((colors) => {
//           book.colors = colors;
//           return book;
//       }).catch((err) => console.log(err));
//       return m; 
//   });
//   return await Promise.all(proms);
// }


const addColors = async (bookResult) => {

    // let m = 
  let m = Vibrant.from(bookResult.volumeInfo.imageLinks?.thumbnail).getSwatches().then((swatch) => {
      let colors = [];
          colors.push({rgb: rgbToString(swatch.Vibrant.getRgb()), hex: swatch.Vibrant.getHex(), hsl: hslToString(swatch.Vibrant.getHsl())});
          colors.push({rgb: rgbToString(swatch.Muted.getRgb()), hex: swatch.Muted.getHex(), hsl: hslToString(swatch.Muted.getHsl())});
          colors.push({rgb: rgbToString(swatch.DarkVibrant.getRgb()), hex: swatch.DarkVibrant.getHex(), hsl: hslToString(swatch.DarkVibrant.getHsl())});
          colors.push({rgb: rgbToString(swatch.DarkMuted.getRgb()), hex: swatch.DarkMuted.getHex(), hsl: hslToString(swatch.DarkMuted.getHsl())});
          colors.push({rgb: rgbToString(swatch.LightVibrant.getRgb()), hex: swatch.LightVibrant.getHex(), hsl: hslToString(swatch.LightVibrant.getHsl())});
          colors.push({rgb: rgbToString(swatch.LightMuted.getRgb()), hex: swatch.LightMuted.getHex(), hsl: hslToString(swatch.LightMuted.getHsl())});
          return colors;
    });
    const colors = await Promise.resolve(m);
    Color.insertMany(colors).then((colors) => {
      console.log(colors[0]);
      return colors;
    })
}

const addBook = async (bookResult) => {
  
  const b = {
    title: bookResult.volumeInfo.title,
    thumbnail: bookResult.volumeInfo.imageLinks.thumbnail,
    authors: bookResult.volumeInfo.authors,
    categories: bookResult.volumeInfo.categories
  }

  for (let isbn of bookResult.volumeInfo.industryIdentifiers) {
    if (isbn.type === "ISBN_13") {
      b.isbn13 = isbn.identifier
    } else if (isbn.type === "ISBN_10") {
      b.isbn10 = isbn.identifier
    }
  }

  // console.log("====\n\n\n\n\n");
  // console.log( addColors(bookResult));
  // console.log("\n\n\n\n\n====");
  // b.swatches = addColors(bookResult).map((c) => c._id);

  const book = new Book(b);
  return book.save();
}


const getBooks = async (items) => {
   const proms = items.map((bookItem) => {
      if (bookItem.volumeInfo.imageLinks?.thumbnail != undefined) {
        let isbn = bookItem.volumeInfo.industryIdentifiers[0];
     
        let b = Book.findOne({ [isbn.type.toLowerCase().replace("_", "")]: isbn.identifier })
          .then((book) => {
            if (!book) {
              return addBook(bookItem);
            }
            return book;
          }).catch((err) => {
            console.log(err);
          });

          return b;
      }
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
      maxResults: 10,
    }
  }).then((response) => {
    return getBooks(response.data.items);
  })
  .then((bookResults) => {
    return bookResults.map((b) => {
        return {
          title: b.title,
          thumbnail: b.thumbnail,
          authors: b.authors
        };
    });
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