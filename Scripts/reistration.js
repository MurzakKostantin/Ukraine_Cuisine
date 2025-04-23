
document.getElementById("email").addEventListener("blur", function() {
    if(document.getElementById("email").value.trim() === "") {
        document.getElementById("emailError").textContent = "Email не може бути пустим";
    }
    else {
        document.getElementById("emailError").textContent = "";
    }
});

document.getElementById("login").addEventListener("blur", function() {
    if(document.getElementById("login").value.trim() === "") {
        document.getElementById("loginError").textContent = "Логін не може бути пустим";
    }
    else {
        document.getElementById("loginError").textContent = "";
    }
});

document.getElementById("password").addEventListener("blur", function() {
    if(document.getElementById("password").value.trim() === "") {
        document.getElementById("passwordError").textContent = "Пароль не може бути пустим";
    }
    else {
        document.getElementById("passwordError").textContent = "";
    }
});

document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Забороняємо стандартне відправлення форми

    const login = document.getElementById("login").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    // Перевірка на порожні поля та співпадіння паролів
    if (password !== password2 || password === "" || login === "" || email === "" || password2 === "") {
        alert("Заповніть будь-ласка усі поля та переконайтеся, що паролі співпадають.");
    } else {
        // Відправка даних на сервер
        const response = await fetch("https://ukraine-cuisine.vercel.app/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ login, email, password })
        });

        const data = await response.json();
        if (data.success) {
            alert("Реєстрація успішна!");
            // Зберігаємо дані користувача в localStorage для подальшого використання
            localStorage.setItem("user", JSON.stringify(data.user));
// Перевіримо, що user.name точно існує
            if (data.user && data.user.name) {
                window.location.href = "../HTML/UserProfile.html";
            } else {
                alert("Сталася помилка при обробці профілю користувача.");
            }
        } else {
            alert("Помилка: " + data.message); // Показуємо повідомлення про помилку
        }
    }
});