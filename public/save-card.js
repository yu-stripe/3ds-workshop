// This is your test publishable API key.

let elements;

initialize();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

function getCustomerId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('customer_id');
}

function addCustomerIdToUrl(customerId) {
  const productsLink = document.getElementById('products-link');
  if (customerId) {
    productsLink.href = `checkout.html?customer_id=${customerId}`;
  }
}

async function initialize() {
  const customerId = getCustomerId();
  if (!customerId) {
    showMessage("サインアップされてません");
    return;
  }

  addCustomerIdToUrl(customerId);

  // 保存済みのカード情報を取得
  await fetchSavedCards(customerId);

  const response = await fetch(`${backend}/create-setup-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customerId }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });



  const paymentElement = elements.create("payment");
  
  paymentElement.mount("#payment-element");

  // Event
  fetchAndDisplayWebhookEvents();
  setInterval(fetchAndDisplayWebhookEvents, 60000);
}

async function fetchSavedCards(customerId) {
  try {
    const response = await fetch(`${backend}/get-saved-cards?customer_id=${customerId}`);
    const data = await response.json();
    if (data.cards && data.cards.length > 0) {
      displaySavedCards(data.cards);
    }
  } catch (error) {
    console.error('Error fetching saved cards:', error);
  }
}


async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmSetup({
    elements,
    confirmParams: {
      return_url: 'https://example.com',
    },
    redirect: 'if_required',
  });

  if (error) {
    if (error.type === "card_error" || error.type === "validation_error") {
      showMessage(error.message);
    } else {
      showMessage("An unexpected error occurred.");
    }
  } else {
    showMessage("Setup successful!");
    // 新しいカードが保存されたら、保存済みカードリストを更新
    const customerId = getCustomerId();
    await fetchSavedCards(customerId);
  }

  setLoading(false);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}

function setDpmCheckerLink(url) {
  document.querySelector("#dpm-integration-checker").href = url;
}


function displaySavedCards(cards) {
  const savedCardsContainer = document.getElementById('saved-cards');
  const savedCardsList = document.getElementById('saved-cards-list');
  savedCardsList.innerHTML = '';

  if (cards.length === 0) {
    savedCardsContainer.classList.add('hidden');
    return;
  }

  cards.forEach(card => {
    const listItem = document.createElement('div');
    listItem.classList.add('card-item');

    const cardInfo = document.createElement('div');
    cardInfo.classList.add('card-info');

    const cardNumber = document.createElement('div');
    cardNumber.classList.add('card-number');
    cardNumber.textContent = `**** **** **** ${card.last4}`;

    const cardExpiry = document.createElement('div');
    cardExpiry.classList.add('card-expiry');
    cardExpiry.textContent = `${card.exp_month}/${card.exp_year}`;

    cardInfo.appendChild(cardNumber);
    cardInfo.appendChild(cardExpiry);

    listItem.appendChild(cardInfo);

    savedCardsList.appendChild(listItem);
  });

  savedCardsContainer.classList.remove('hidden');
}
