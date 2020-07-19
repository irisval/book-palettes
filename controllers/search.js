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



const getColors = async (bookResult) => {

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

  const b = {
    title: bookResult.volumeInfo.title,
    thumbnail: bookResult.volumeInfo.imageLinks.thumbnail,
    authors: bookResult.volumeInfo.authors,
    categories: bookResult.volumeInfo.categories,
    swatches: colors
  }


  for (let isbn of bookResult.volumeInfo.industryIdentifiers) {
    if (isbn.type === "ISBN_13") {
      b.isbn13 = isbn.identifier
    } else if (isbn.type === "ISBN_10") {
      b.isbn10 = isbn.identifier
    }
  }
  const book = new Book(b);
  
  let data =  book.save().then((bookData) => {
    console.log(bookData.title);
    console.log("what");
    return bookData;
  })
  .catch((err) => {
    console.log(err);
  });
  return data;
}


const getBooks = async (items) => {

  const proms = items.filter((bookItem) => {
    return bookItem.volumeInfo.imageLinks?.thumbnail != undefined && bookItem.volumeInfo.industryIdentifiers != undefined
  }).map(async (bookItem) => {
    let isbn = bookItem.volumeInfo.industryIdentifiers[0];

    let result = await Book.exists({[isbn.type.toLowerCase().replace("_", "")]: isbn.identifier});

    if (!result) {
      // console.log("adding new book");
      //  console.log("adding new book");
      //   console.log("adding new book");
      //  console.log("adding new book\n");
     await addBook(bookItem);
    }




    return Book.findOne({
      [isbn.type.toLowerCase().replace("_", "")]: isbn.identifier
    })
    .populate({path: 'swatches', model: 'Color', select: '-books'})
    .exec();



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
    console.log(bookResults);
    return bookResults.map((b, i) => {
      console.log(i);
      console.log(b?.title);
      console.log("\n\n");
      let sw = b.swatches.map((s) => {
        return [s.rgb, s.hex, s.hsl];
      })

      return {
        title: b.title,
        thumbnail: b.thumbnail,
        authors: b.authors,
        swatches: sw
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