const stripe = Stripe("pk_test_51NQQoIEzgtKktpOy7rP0KtN9n9zBguSzEPYRvjaGuDzcFek2N9gN69tikNBWtdb2Pq2FkkHYWks0qydQBcJEpu3i00SbjW9HWP");
const backend = "https://threeds-workshop.onrender.com";



// ------- UI helpers -------
function showMessage(messageText) {
  const messageContainer = document.querySelector("#header-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 6000);
}


function getCustomerId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('customer_id');
}

function checkCustomerId() {
  const customerId = getCustomerId();
  if (!customerId) {
    showMessage("Customer ID が見つかりません. サインアップしてください。");
    setTimeout(() => {
      window.location.href = 'signup.html';
    }, 2000); 
    return null; 
  }
  return customerId; 
}

function addCustomerIdToUrl(customerId) {
  const customerLinks = document.querySelectorAll('a.customer-link');

  customerLinks.forEach(linkElement => {
    if (customerId) {
      linkElement.href = `${linkElement.href.split('?')[0]}?customer_id=${customerId}`;
    }
  });
}
