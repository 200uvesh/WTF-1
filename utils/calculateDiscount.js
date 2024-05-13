exports.getDiscount = (amount, discount_percentage) => {
  var discountAmount = (amount * discount_percentage) / 100;
  var priceAfterDiscount = amount - discountAmount;

  return priceAfterDiscount;
};
