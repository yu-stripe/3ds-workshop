let selectedCardId = null;

initialize();

function getCustomerId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('customer_id');
}

async function initialize() {
  const customerId = getCustomerId();
  if (!customerId) {
    showMessage("顧客が指定されていません。");
    return;
  }

  document.getElementById('customer-id').textContent = customerId;

  // 保存済みのカード情報を取得
  await fetchSavedCards(customerId);

  // Webhookイベントを取得
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
    
    const label = document.createElement('label');
    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = 'saved-card';
    radioInput.value = card.id;  // Card IDが必要
    radioInput.addEventListener('change', () => {
      selectedCardId = card.id;
      document.getElementById('pay-button').classList.remove('hidden');
    });

    label.appendChild(radioInput);
    label.appendChild(document.createTextNode(`**** **** **** ${card.last4} (Expires: ${card.exp_month}/${card.exp_year})`));
    listItem.appendChild(label);
    savedCardsList.appendChild(listItem);
  });

  savedCardsContainer.classList.remove('hidden');
}

document.getElementById('pay-button').addEventListener('click', async () => {
  if (!selectedCardId) {
    showMessage("カードを選択してください。");
    return;
  }
  
  const amount = 1000; // 決済する金額（単位：セント）
  await processPayment(selectedCardId, amount);
});

async function processPayment(cardId, amount) {
  try {
    const customerId = getCustomerId();
    const response = await fetch(`${backend}/create-intent-off-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId, payment_method_id: 'pm_1QN2ygEzgtKktpOy1mVGnHbT' }),
    });


    const result = await response.json();
    console.log(result.intent.status)
    if (result.intent.status === "succeeded") {
      showMessage("決済成功!");
      // ここで必要に応じてページ遷移やUIの更新を行います
    } else {
      showMessage("決済に失敗しました。エラー: " + result.intent.status);
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    showMessage("決済中にエラーが発生しました。");
  }
}

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");
  messageContainer.textContent = messageText;
  messageContainer.classList.remove("hidden");

  setTimeout(() => {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

async function fetchAndDisplayWebhookEvents() {
  const customerId = getCustomerId();

  try {
    const response = await fetch(`${backend}/webhook-events/${customerId}`);
    const events = await response.json();
    const eventsList = document.getElementById('webhook-events');
    eventsList.innerHTML = '';

    events.forEach(event => {
      const li = document.createElement('li');
      li.textContent = `ID: ${event.id} - ${event.type} - ${new Date(event.created * 1000).toLocaleString()}`;
      eventsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
  }
}

