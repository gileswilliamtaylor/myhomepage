$(function() {
  showOrder();
});

// Prints order to DOM
function showOrder() {
	var i,
	  order = $(".order"),
	  myOrder = JSON.parse(localStorage.getItem("order")),
	  dishInfo,
	  myOrderToPrint = [];

	for (i = 0; i < myOrder.length; i++) {
		dishInfo = myOrder[i].quantity + "x " + myOrder[i].name;
		myOrderToPrint.push(dishInfo);
	}

	order.text(myOrderToPrint.join(", "));
}