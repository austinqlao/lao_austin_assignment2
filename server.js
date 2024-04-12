// loads the products array from the .json file
const products = require(__dirname + '/products.json');
const express = require('express');
const app = express();

// form data for POST request 
const myParser = require("body-parser"); 
app.use(myParser.urlencoded({ extended: true }));

// keeps track of requests to the console
app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});


// this javascript defines products array
app.get('/products.json', function (req, res, next) {
  res.json(products);
});


// if quantities are valid, if not it redirects back
app.post('/process_purchase_form', function (req, res, next) {
  console.log(req.body)
  // process if purchase form submitted
  const errors = {}; // if no errors
  let quantities = [];
  if (typeof req.body['quantity_textbox'] != 'undefined') {
    quantities = req.body['quantity_textbox'];
    // Loop through the quantities submitted
    for (let i in quantities) {
      // validate the quantity if it is a non-negative integer
      if (!isNonNegInt(quantities[i])) {
        errors['quantity' + i] = isNonNegInt(quantities[i], true).join('<br>');
      } else {
        const productId = parseInt(i);
        const requestedQty = parseInt(quantities[i]);
        //checks if quantity is less than or equal to the quantity available
        if (!isNaN(productId) && products[productId] && products[productId].quantity_available < requestedQty) {
          errors['quantity' + i] = 'Not enough available in inventory';
        }
      }
    }
    // Checks if the quantities array has at least one value greater than 0
    if (!quantities.some(qty => parseInt(qty) > 0)) {
      errors['quantity'] = 'Please select at least one item to purchase';
    }

    //logs the purchase data to the console and where it came from.
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
  }

  // create a query string with data from the form
  const params = new URLSearchParams();
  params.append('quantities', JSON.stringify(quantities));

  //if errors are present, it sends them back. If not, it goes to the invoice

  if (Object.keys(errors).length > 0) {
    // errors present , redirect back to store - fix and try again
    params.append('errors', JSON.stringify(errors));
    res.redirect('store.html?' + params.toString());
  } else {
    updateInventory(quantities)
    //redirects to invoice
    res.redirect('./invoice.html?' + params.toString());
  }

});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));

// updates the inventory
function updateInventory(quantities) {
  for (let i in quantities) {
    const qty = parseInt(quantities[i]);
    if (!isNaN(qty) && qty > 0) {
      const productId = parseInt(i);
      if (!isNaN(productId) && products[productId] && products[productId].quantity_available >= qty) {
        products[productId].quantity_available -= qty;
        // IR1 count total quantity sold for the chosen product
        if (!products[productId].total_sold) {
          products[productId].total_sold = qty;
        } else {
          products[productId].total_sold += qty;
        }
      }
    }
  } 
}

function isNonNegInt(q, returnErrors = false) {
  errors = []; // no errors at first
  if (q == '') q = 0; // blank inputs if they are 0
  if (Number(q) != q) errors.push('Not a number!'); // number value
  else {
    if (q < 0) errors.push('Negative value!'); //  non-negative value
    if (parseInt(q) != q) errors.push('Not an integer!'); // integer error
  }
  return returnErrors ? errors : (errors.length == 0);
}