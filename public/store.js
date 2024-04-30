function handlePurchase() {
  // Check if the user is logged in by checking a cookie (example: loggedIn=true)
  if (document.cookie.split(';').some((item) => item.trim().startsWith('loggedIn='))) {
    // If logged in, submit the form
    document.querySelector('form').submit();
  } else {
    // If not logged in, redirect to the login page
    window.location.href = './login.html';
  }
}


// transform the query string into a user-friendly object.
const params = (new URL(document.location)).searchParams;
let errors = {};
let quantities = [];

// Look for problems in the query string and parse it if necessary.

if (params.has('errors')) {
  errors = JSON.parse(params.get('errors'));
  // Obtain the quantities to add to the form in order to make it sticky.
  quantities = JSON.parse(params.get('quantities'));
  // If there are any issues, display an alert box.
  // If you have a mistake in your code that indicates no amounts were picked, change this to trigger an alert.

  alert('Please fix errors and retry');
}

// IR4 
function updatePurchaseButton() {
  //creates a variable to alter the Purchase button's value.

  const purchaseButton = document.getElementById("purchaseButton");
  // guarantees that the array's length is higher than 0 and that it is 0

  if (quantities.length > 0 && quantities.every(qty => parseInt(qty) == 0)) {
    purchaseButton.value = "SELECT ITEMS TO PURCHASE";
  //The purchase button will show this message if there is a non-NegInt problem.

  } else if (Object.keys(errors).length > 0) {
    purchaseButton.value = "Please fix the errors and try again";
  } else {
    purchaseButton.value = "Purchase!";
  }
}

let products;
window.onload = async function () {
  // To obtain product information from the server, use fetch. following the successful loading and formatting of the products as a JSON object. Show the items on the page.

  await fetch('products.json').then(await function (response) {
    if (response.ok) {
      response.json().then(function (json) {
        products = json;
        display_products();
        updatePurchaseButton();
      });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  });
}

// function to carry out the product filtering

function myFunction() {
  var input, filter, ul, si, a, i, txtValue;
  input = document.getElementById("search_textbox");
  filter = input.value.toUpperCase();
  si = document.getElementsByTagName("section");
  for (i = 0; i < si.length; i++) {
    a = si[i].getElementsByTagName("h2")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      si[i].style.display = "";
    } else {
      si[i].style.display = "none";
    }
  }
}


function display_products() {
  // loops through the array of goods, displaying each one as a section element.

  for (let i = 0; i < products.length; i++) {
    let quantity_label = 'Quantity';
    // Put the issue in the label so that it is visible if there is a problem with this quantity.

    if( (typeof errors['quantity'+i]) != 'undefined' ) {
      quantity_label = `<font class="error_message">${errors['quantity'+i]}</font>`;
    }
    let quantity = 0;
    // insert the previous amount, if any, in the text box.

    if((typeof quantities[i]) != 'undefined') {
      quantity = quantities[i];
    }
    products_main_display.innerHTML += `
    <section class="item">
    <div style="text-align: center;">
    <h2 style=" ;">${products[i].name}</h2>
        <img src="./images/${products[i].image}" height="150px" width="150px"> 
    </div>

    <p style="font-size: larger; font-weight: bold; text-align: center;">$${products[i].price}</p>
   
    <label>${quantity_label}</label>
   
    <input type="text" placeholder="0" name="quantity_textbox[${i}]" value="${quantity}">

    </section>
`;
  }
}