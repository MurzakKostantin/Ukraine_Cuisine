document.getElementById("createNewAccount").addEventListener("click", function () {
        window.location.href = "../HTML/Registration.html";
        alert("перехід на сторінку реєстрації")
    })
document.getElementById("email").addEventListener("blur", function() {
    if(document.getElementById("email").value.trim() === "") {
        document.getElementById("emailError").textContent = "Email не може бути пустим";
    }
    else {
        document.getElementById("emailError").textContent = "";
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

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Забороняємо стандартне відправлення форми

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Відправляємо запит на сервер
    const response = await fetch("http://localhost:3000/api/login", {  // Замінено на 3000
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
        // Якщо успішно — переходимо на сторінку профілю
        alert("Вірна пошта і пароль!");

        // Зберігаємо дані користувача в localStorage для подальшого використання
        localStorage.setItem("user", JSON.stringify(data.user));

        // Перехід на сторінку профілю
        window.location.href = "../HTML/UserProfile.html";
    } else if (!data.success) {
        alert("Невірна пошта або пароль!");
    }
});