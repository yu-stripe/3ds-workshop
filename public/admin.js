let selectedCardId = null;

initialize();


async function initialize() {
  const customerId = checkCustomerId();
  if (!customerId) {
    return;
  }

  addCustomerIdToUrl(customerId);

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
      displayCustomerInfo(data.customer); 
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
      body: JSON.stringify({ customer_id: customerId, payment_method_id: cardId}),
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


function displayCustomerInfo(customerData) {
    // 顧客情報を更新するHTML要素を取得
  const customerEmailElement = document.getElementById("customer-email");
  const customerIdElement = document.getElementById("customer-id");
  const customerCreatedElement = document.getElementById("customer-created"); 

  customerEmailElement.textContent = customerData.email;
  customerIdElement.textContent = customerData.id;

  const createdDate = new Date(customerData.created * 1000); // UNIXタイムスタンプをミリ秒に変換
  customerCreatedElement.textContent = createdDate.toLocaleString('ja-JP'); 
}
