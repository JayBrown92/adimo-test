const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

/* 
function to request html data via axios, parse html via cheerio, store results in an object array, and then finally calculate total num of product entries and avg total cost.

 */
const scrapeHTML = async () => {
  try {
    //  get document data via axios get request
    const { data } = await axios.get(
      "https://cdn.adimo.co/clients/Adimo/test/index.html"
    );

    //parse html data
    const $ = cheerio.load(data);

    //empty object array for storing list of products
    const products = [];

    //find each element with class of .item
    $("div.item").each((i, elem) => {
      // Initialise product object
      const product = {
        id: i,
        title: "",
        imgURL: "",
        price: 0,
        oldPrice: 0,
      };

      //get h1 text and add to object
      product.title = $(elem).children("h1").text();

      // get img attribute value and add to object
      product.imgURL = $(elem).children("img").attr("src");

      // get price from span with class of .price and add to obj
      product.price = parseFloat(
        $(elem)
          .children("span.price")
          .text()
          .replace(/[^0-9\.-]+/g, "")
      );

      // get pre discounted price from span with class of .oldPrice and add to obj
      product.oldPrice = parseFloat(
        $(elem)
          .children("span.oldPrice")
          .text()
          .replace(/[^0-9\.-]+/g, "")
      );

      // add each object to products array
      products.push(product);
    });

    //get total number of products by counting id's
    const numOfProducts = products.filter((product) => product.id >= 0).length;

    // get avg cost by first calculating total and then dividing by total number of products
    const avgCost =
      products.reduce((accumulator, object) => {
        return accumulator + object.price;
      }, 0) / numOfProducts;

    //object containing products, num of products and avg cost for writing to file
    const allResults = { products, numOfProducts, avgCost };

    // parse results to json and write to file called products
    fs.writeFile(
      "./products.json",
      JSON.stringify(allResults, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

scrapeHTML();
