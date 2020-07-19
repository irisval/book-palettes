const axios = require('axios');
const Vibrant = require('node-vibrant')
const Book = require('../models/book');
const Color = require('../models/color');

exports.getIndex = (req, res, next) => {
  res.render('index');
};

// todo: replace with getters in schema
let rgbToString = (rgb) => {
  return "rgb (" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
}

let hslToString = (hsl) => {
  return "hsl (" + hsl[0] + "," + hsl[1] + "," + hsl[2] + ")";
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




const getColors = async (bookResult) => {

  // let m = 
  let colors = Vibrant.from(bookResult.volumeInfo.imageLinks?.thumbnail).getSwatches().then((swatch) => {
    let c = [];
    c.push({
      rgb: rgbToString(swatch.Vibrant.getRgb()),
      hex: swatch.Vibrant.getHex(),
      hsl: hslToString(swatch.Vibrant.getHsl())
    });
    c.push({
      rgb: rgbToString(swatch.Muted.getRgb()),
      hex: swatch.Muted.getHex(),
      hsl: hslToString(swatch.Muted.getHsl())
    });
    c.push({
      rgb: rgbToString(swatch.DarkVibrant.getRgb()),
      hex: swatch.DarkVibrant.getHex(),
      hsl: hslToString(swatch.DarkVibrant.getHsl())
    });
    c.push({
      rgb: rgbToString(swatch.DarkMuted.getRgb()),
      hex: swatch.DarkMuted.getHex(),
      hsl: hslToString(swatch.DarkMuted.getHsl())
    });
    c.push({
      rgb: rgbToString(swatch.LightVibrant.getRgb()),
      hex: swatch.LightVibrant.getHex(),
      hsl: hslToString(swatch.LightVibrant.getHsl())
    });
    c.push({
      rgb: rgbToString(swatch.LightMuted.getRgb()),
      hex: swatch.LightMuted.getHex(),
      hsl: hslToString(swatch.LightMuted.getHsl())
    });
    return c;
  });

  let palette = await Promise.resolve(colors);

  const proms = palette.map((swatchColor) => {
    let c = Color.findOne({
        hex: swatchColor.hex
      })
      .then((color) => {
        if (!color) {
          const c = new Color({
            hex: swatchColor.hex,
            rgb: swatchColor.rgb,
            hsl: swatchColor.hsl
          });
          return c.save();
        }
        return color;
      })
      .then((color) => {
        return color._id;
      })
      .catch((err) => {
        console.log(err);
      });

    return c;
  });

  return await Promise.all(proms);
}

const addBook = async (bookResult) => {


  let colors = await Promise.resolve(getColors(bookResult));
  console.log(colors);
  console.log("wassupppp\n\n\n");
  const b = {
    title: bookResult.volumeInfo.title,
    thumbnail: bookResult.volumeInfo.imageLinks.thumbnail,
    authors: bookResult.volumeInfo.authors,
    categories: bookResult.volumeInfo.categories,
    swatches: colors
  }

  // swatches = [];
  // for (let c in colors) {
  //     console.log("\n\n===");
  //   console.log({...c._doc});
  //   console.log("\n\n===");
  //   // swatches.push({...c._doc});
  // }
  // b.swatches = swatches;

  for (let isbn of bookResult.volumeInfo.industryIdentifiers) {
    if (isbn.type === "ISBN_13") {
      b.isbn13 = isbn.identifier
    } else if (isbn.type === "ISBN_10") {
      b.isbn10 = isbn.identifier
    }
  }
  const book = new Book(b);
  return book.save();

  // console.log("====\n\n\n\n\n");
  // console.log( addColors(bookResult));
  // console.log("\n\n\n\n\n====");
  // b.swatches = addColors(bookResult).map((c) => c._id);
  // b.swatches = getColors(bookResult);
  // console.log(getColors(bookResult));
  // 
  // const c = getColors(bookResult);
  // console.log(c[0]);
  // b.swatches = getColors(bookResult).map((c) => c._id);
  // const book = new Book(b);
  // return book.save();
}


const getBooks = async (items) => {

  const proms = items.filter((bookItem) => {
    return bookItem.volumeInfo.imageLinks?.thumbnail != undefined && bookItem.volumeInfo.industryIdentifiers != undefined
  }).map((bookItem) => {
    let isbn = bookItem.volumeInfo.industryIdentifiers[0];
    let b =  Book.findOne({
      [isbn.type.toLowerCase().replace("_", "")]: isbn.identifier
    }).lean();

    if (b === null) {
      return addBook(bookItem);
    }


    b.populate({path: 'swatches', model: 'Color', select: '-books'}).exec();

   return b;


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
        b.swatches.map((s) => {
          console.log(s.hex);
        })

        return {
          title: b.title,
          thumbnail: b.thumbnail,
          authors: b.authors,
          swatches: b.swatches
        };
      });
    })
    .then((bookResults) => {
      console.log(bookResults);
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