// signup.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector("#signup-form");
    loginForm.addEventListener("submit", handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    if (password !== "stripe3ds") {
        showMessage("パスワードが間違っています。");
        setLoading(false);
        return;
    }

    try {
        // サーバーサイドの /create-customer API を呼び出す
        const response = await fetch(`${backend}/create-customer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
            throw new Error('APIリクエストに失敗しました');
        }

        const data = await response.json();
        console.log('Customer created:', data);

        // ログイン成功時の処理
        // 必要に応じて、作成されたcustomer.idをローカルストレージなどに保存することもできます
        // localStorage.setItem('customerId', data.id);

        window.location.href = "save-card.html?customer_id=" + data.id;
    } catch (error) {
        console.error('Error:', error);
        showMessage("予期せぬエラーが発生しました。");
    }

    setLoading(false);
}

function showMessage(messageText) {
    const messageContainer = document.querySelector("#singup-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = "";
    }, 4000);
}

function setLoading(isLoading) {
    if (isLoading) {
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}

