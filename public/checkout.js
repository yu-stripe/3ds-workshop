// This is your test publishable API key.

let elements;

initialize();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);


async function initialize() {
  const customerId = checkCustomerId();
  if (!customerId) {
    return;
  }

  addCustomerIdToUrl(customerId);

  const response = await fetch(`${backend}/create-intent-and-customer-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customerId }),
  });
  const { clientSecret, customerSessionClientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  const layout = {
    type: 'accordion'
  }
  elements = stripe.elements({ appearance, clientSecret, customerSessionClientSecret });

  const paymentElement = elements.create("payment", { layout });
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: 'https://stripe.com',
    },
    redirect: "if_required",
  });

  if (error) {
    if (error.type === "card_error" || error.type === "validation_error") {
      showMessage(error.message);
    } else {
      showMessage("An unexpected error occurred.");
    }
  } else {
    showMessage("購入 成功!");
    // 新しいカードが保存されたら、保存済みカードリストを更新
    const customerId = getCustomerId();
  }
  await initialize();

  setLoading(false);
}

