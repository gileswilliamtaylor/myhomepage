// GLOBAL VAR
var myOrder = [];


// EVENT LISTENERS
$(function() {
  buildMenu("menu.json");
  buyNow();
  mobileBasketButton();
});

$(window).scroll(function() {
  stickers();
  updateHeader();
});

$(window).resize(function() {
  if ($(window).width() >= 786) {
    var menu = $(".menu"),
      rightColumn = $(".right-column");

    menu.show();
    rightColumn.show();
  }
})


// Calls menu.json and populates the menu div with items -- courses split into separate lists
function buildMenu(menujson) {
  var courses = $("#courses"),
    menu = $("#menu");

  $.ajax({
    url: menujson,
    dataType: "JSON",
    success: function(data) {
      products = data;
      $.each(data.courses, function(key, val) {
        var courseId = val.id;
        menu.append(
          "<div id='" + courseId + "'>" +
            "<h4>" + val.course + "</h4>" +
            "<ul></ul>" +
          "</div>"
        );
        var courseUL = $("#" + courseId + " ul");
        $.each(data.courses[key].dishes, function(key, dish) {
          courseUL.append(
            "<li>" +
              "<span class='dish-name'>" +
                dish.name +
              "</span>" +
              "<span class='dish-price'>£" +
                Number((dish.price).replace(/[^0-9.]/g, "")).toFixed(2) +
              "</span>" +
              "<blockquote>" +
                dish.description +
              "</blockquote>" +
              "<button type='button' class='menu-button' id='" +
                courseId + "-" + dish.id + 
              "' aria-label='" +
                dish.name +
              "'></button>" +
            "</li>"
          );
        });
        courses.append(
          "<li><a href='#" +
            courseId +
          "'>" +
            val.course +
          "</a></li>"
        );
      });

      smoothScrollToCourses();
      chooseDish();
    },
    error: function() {
      menu.append("<p class='error'>The kitchen must be closed.</p>");
    }
  });
}

// When user clicks on courses on sidebar (medium+ screens only) window scrolls smootly
function smoothScrollToCourses() {
  var courseLink = $("a[href^='#']"),
    htmlBody = $("html, body");
  courseLink.click(function(event) {
    var target = $(this.getAttribute("href"));
    if (target.length) {
      event.preventDefault();
      htmlBody.stop().animate({
        scrollTop: target.offset().top - 75
      }, 1000);
    }
  });
}

// Checks whether or not dish has already been chosen or if too many (99) have been ordered already
function chooseDish() {
    var menuItems = $(".menu-button");
    menuItems.click(function() {
      var dishClicked = $(this).attr("id").split("-"),
        courseId = dishClicked[0],
        dishId = dishClicked[1],
        dish = findDish(courseId, dishId),
        dishInMyOrder = false;
        ninetyninthDish = false;

      for (var i = 0; i < myOrder.length; i++) {
        if (myOrder[i].id === dish.id) {
          // If dish already exists in order...
          dishInMyOrder = true;
          if (myOrder[i].quantity < 99) {
            // And if less than 99 of these items have previously been ordered...
            myOrder[i].quantity += 1;
            myOrder[i].dishTotal = myOrder[i].price * myOrder[i].quantity;
          } else {
            ninetyninthDish = true;
          }
          break;
        }
      }
      
      if (!dishInMyOrder) {
        // If the dish hasn't already been ordered...
        dish.quantity = 1;
        dish.dishTotal = Number(dish.price);
        myOrder.push(dish);
      }

      updateMyOrder(dish, dishInMyOrder, ninetyninthDish);
      showBasket();
      updateTotal();
    });
}

// Finds selected dish in "products" object
function findDish(courseId, dishId) {
  for (var i = 0; i < products.courses.length; i++) {
    if (products.courses[i].id === courseId) {
      for (var j = 0; j < products.courses[i].dishes.length; j++) {
        if (products.courses[i].dishes[j].id === dishId) {
          return products.courses[i].dishes[j];
        }
      }
    }
  }
}

// Updates My Order in DOM...
function updateMyOrder(dish, dishInMyOrder, ninetyninthDish) {
  var order = $("#order");
  
  if (!dishInMyOrder) {
    // ... creating a new entry if none exists...
    order.append(
      "<li class='ordered-item' id='" + dish.id + "'>" +
        "<span class='ordered-quantity'>" +
          dish.quantity + "x" +
        "</span>" +
        "<span class='ordered-name'>" +
          dish.name +
        "</span>" +
        "<span class='ordered-price'>" +
          "£" + Number(dish.dishTotal).toFixed(2) +
        "</span>" +
        "<span id='remove-" + dish.id + "'class='remove-item'>" +
          "<span></span>" +
            "<span></span>" +
          "<button type='button' " +
            "class='remove-item-button'" +
            "id='remove-button-" +
            dish.id +
          "' aria-label='Remove " +
            dish.name +
          "'>" +
          "</button>" +
        "</span>" +
      "</li>"
    );
    var orderedItem = $("li.ordered-item");
    addAndRemoveButton(orderedItem);
    removeItem(dish.id);
  } else if (dishInMyOrder && !ninetyninthDish) {
    // ... or updates the current entry, unless the order exceeds 99 units
    var dishOrdered = $("#" + dish.id),
      quantity = dishOrdered.find(".ordered-quantity"),
      price = dishOrdered.find(".ordered-price");
    quantity.text(dish.quantity + "x");
    price.text("£" + Number(dish.dishTotal).toFixed(2));
  } else {
    var lead = "That's too much!",
      text = "99 orders of " +
        dish.name +
        " is as much as anybody needs.";
    message(lead, text);
  }
}

// Creates a remove button (X), which only appears on mouseover on non-mobile screens
function addAndRemoveButton(orderedItem) {
  orderedItem.mouseover(function() {
    var removeItem = $("#remove-" + $(this).attr("id"));
    removeItem.addClass("remove-me-now");
  }).mouseleave(function() {
    var removeItem = $("#remove-" + $(this).attr("id") + ".remove-item");
    removeItem.removeClass("remove-me-now");
  });
}

// Shows basket when order isn't empty 
function showBasket() {
  var emptyBasket = $("#empty-basket"),
    basket = $("#basket");
  if (myOrder.length) {
    emptyBasket.hide();
    basket.show();
  } else {
    emptyBasket.show();
    basket.hide();
  }
}

// Updates total in DOM
function updateTotal() {
  var total = myOrder.reduce(function(a, b) {
      return a + b.dishTotal;
    }, 0),
    totalPrice = $(".total-price"),
    underMin = $("#under-minimum-spend"),
    ourFee = $("#our-fee"),
    buyNow = $("#buy-now"),
    ourFees = 2,
    mobBasketButton = $("#mob-basket-button");

  if (total < 15) {
    // Tells user minimum spend has not been met
    underMin.show();
    ourFee.hide();
    buyNow.hide();
  } else {
    // Adds our fee
    total += ourFees;
    underMin.hide();
    ourFee.show();
    buyNow.show();
  }
  var totalText = "£" + total.toFixed(2);
  totalPrice.text(totalText);
  
  if ($(window).width() < 786)
    // Shows total cost in basket button
    totalText === "£0.00" ? mobBasketButton.text("Basket") : mobBasketButton.text(totalText); 
}

// Removes item from order, reducing item quantity by 1 if quantity in order > 1
function removeItem(dishId) {
  var removeItemButton = $("#remove-button-" + dishId);
  removeItemButton.click(function() {
    for (var i = 0; i < myOrder.length; i++) {
      if (myOrder[i].id === dishId) {
        var itemToBeRemoved = myOrder[i];
        if (itemToBeRemoved.quantity > 1) {
          itemToBeRemoved.quantity--;
          itemToBeRemoved.dishTotal = myOrder[i].price * myOrder[i].quantity;
          updateMyOrder(itemToBeRemoved, true);
        } else {
          myOrder = $.grep(myOrder, function(value) {
            return value !== itemToBeRemoved;
          });
          var ULToBeRemoved = $("#" + dishId);
          ULToBeRemoved.remove();
        }
      }
    }
    updateTotal();
    if (!myOrder.length)
      showBasket();
  });
}

// Adds message to DOM
function message(lead, text) {
  var messageContainer = $("#message-container"),
    messageLead = $("#message-lead"),
    messageText = $("#message");
  messageLead.text(lead);
  messageText.text(text);
  messageContainer.addClass("visible-message");
  messageButton(messageContainer);
}

// Closes message
function messageButton(messageContainer) {
  var button = $("#message-button");
  button.click(function() {
    messageContainer.removeClass("visible-message");
  });
}

// Accepts order 
function buyNow() {
  var buyNowButton = $(".buy-now");
  buyNowButton.click(OrderConfirmation);
}

// Stores order and opens order confirmation page 
function OrderConfirmation() {
  localStorage.setItem("order", JSON.stringify(myOrder));
  location.href = "order-confirmation.html";
}

// For mobile, click to open and close basket
function mobileBasketButton() {
  var mobBasketButton = $("#mob-basket-button");
  mobBasketButton.click(openAndCloseMobBasket);
}

// Shows/hides menu/basket
function openAndCloseMobBasket() {
  var menu = $("#menu"),
    mobBasketButton = $("#mob-basket-button"),
    order = $(".right-column");
  if (order.is(":visible")) {
    mobBasketButton.removeClass("basket-open");
    order.slideUp();
    menu.fadeIn();
  } else {
    mobBasketButton.addClass("basket-open");
    order.slideDown();
    menu.fadeOut();
  }
}

// Creates sticky sidebar and order form on scroll (non-mobile)
function stickers() {
  var sidebar = $(".sidebar"),
    myOrderDiv = $(".my-order");

  if ($(window).scrollTop() > 300) {
    sidebar.addClass("scrolling-sidebar");
    myOrderDiv.addClass("scrolling-order");
  } else {
    sidebar.removeClass("scrolling-sidebar");
    myOrderDiv.removeClass("scrolling-order");
  }
}

// Shows smaller header/heading on scroll (non-mobile)  
function updateHeader() {
  var h1 = $("h1"),
    smaller = $(".smaller");

  if ($(window).scrollTop() > 250) {
    smaller.addClass("scrolling-header");
  } else {
    smaller.removeClass("scrolling-header");
  }
}