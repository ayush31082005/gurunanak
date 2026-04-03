export const buildBuyNowCheckoutState = (product) => ({
  checkoutItems: [
    {
      ...product,
      pack: product.size || product.pack || product.qty,
      quantity: 1,
    },
  ],
  source: "buy-now",
});

export const proceedToCheckoutWithAuth = (navigate, product) => {
  if (!product) {
    return;
  }

  const checkoutState = buildBuyNowCheckoutState(product);
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login", {
      state: {
        message: "Please login first to continue with checkout.",
        redirectTo: "/checkout",
        checkoutState,
      },
    });
    return;
  }

  navigate("/checkout", { state: checkoutState });
};
