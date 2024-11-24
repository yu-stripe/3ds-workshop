const stripe = Stripe("pk_test_51NQQoIEzgtKktpOy7rP0KtN9n9zBguSzEPYRvjaGuDzcFek2N9gN69tikNBWtdb2Pq2FkkHYWks0qydQBcJEpu3i00SbjW9HWP");
const backend = "https://threeds-workshop.onrender.com";



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
