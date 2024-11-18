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
    showMessage("Customer ID not found. Please log in again.");
    return;
  }

  addCustomerIdToUrl(customerId);

  // 保存済みのカード情報を取得
  await fetchSavedCards(customerId);

  const response = await fetch("http://127.0.0.1:4242/create-setup-intent", {
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
    const response = await fetch(`http://127.0.0.1:4242/get-saved-cards?customer_id=${customerId}`);
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
      return_url: "http://localhost:4242/save-card.html?customer_id=" + getCustomerId(),
    },
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
// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
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


// Webhookイベントを取得して表示する関数
async function fetchAndDisplayWebhookEvents() {
  const customerId = getCustomerId();

  try {
    const response = await fetch(`/webhook-events/${customerId}`);
    const events = await response.json();
    const eventsList = document.getElementById('webhook-events');
    eventsList.innerHTML = '';

    events.forEach(event => {
      const li = document.createElement('li');
      let eventText = `ID: ${event.id} - ${event.type} - ${new Date(event.created * 1000).toLocaleString()}`;
      if (event.setup_intent_id) {
        eventText += ` - SetupIntent ID: ${event.setup_intent_id}`;
      }
      li.textContent = eventText;
      eventsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
  }
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
