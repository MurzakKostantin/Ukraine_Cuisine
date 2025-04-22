window.addEventListener("DOMContentLoaded", () => {
    // Отримуємо дані користувача з localStorage
    const userData = localStorage.getItem("user");

        // Розбираємо JSON
        const user = JSON.parse(userData);

        // Перевіряємо, чи є ключі name та avatar
        if (user && user.name) {
            // Вивести аватарку (перевірка, якщо avatar не null)
            const avatarElement = document.getElementById("avatar");
            avatarElement.src = user.avatar

            // Вивести ім’я користувача
            const nameElement = document.getElementById("name");
            nameElement.placeholder = user.name;

            const emailElement = document.getElementById("email");
            emailElement.placeholder = user.email;

            const aboutMeElement = document.getElementById("aboutMe");
            aboutMeElement.placeholder = user.aboutMe;

        //     const checkFavoriteElement = document.getElementById("demo1");
        //     if (typeof user.isSubscribed !== "undefined") {
        //         checkFavoriteElement.checked = user.isSubscribed;
        //     }
        //     else
        //     {
        //
        //     }
        //     const checkMyRecipeElement = document.getElementById("demo2");
        } else {
            // Якщо структура даних неправильна, переходимо на авторизацію
            alert("Не вдалось завантажити ваші налаштування");
        }
});
document.getElementById("avatar").addEventListener("click", function () {
    document.getElementById("fileInput").click()
})
// Функція для оновлення лічильників
function updateCount(inputId, counterId, maxLength) {
    const inputElement = document.getElementById(inputId);
    const counterElement = document.getElementById(counterId);

    inputElement.addEventListener('input', () => {
        const currentLength = inputElement.value.length;
        counterElement.textContent = `${currentLength}/${maxLength}`;
    });
}

// Оновлюємо лічильники для всіх полів
updateCount('name', 'name-count', 50);
updateCount('aboutMe', 'aboutMe-count', 500);
updateCount('email', 'email-count', 50);


document.getElementById("save-btn").addEventListener("click", async function (event) {
    event.preventDefault(); // Забороняємо стандартне відправлення форми

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const aboutMe = document.getElementById("aboutMe").value;
    // const isSubscribed = document.getElementById("demo1").checked;
    // const isMyRecipe = document.getElementById("demo2").checked;
    const fileInput = document.getElementById('fileInput').files[0];
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;  // Отримуємо userId з об'єкта
    if (user) {
        console.log("User ID:", userId);
    } else {
        console.log("Користувач не знайдений в localStorage");
    }


    fetch('http://localhost:3000/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            email,
            aboutMe,
            userId
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("user", JSON.stringify(data.user));
            } else {
                console.log('Помилка:', data.message);
            }
        })
        .catch(error => {
            console.error('Помилка при завантаженні:', error);
        });

    if (!fileInput) return;

    const formData =  new FormData();
    formData.append('avatar', fileInput);
    formData.append('userId', userId );
    fetch('http://localhost:3000/upload-avatar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data1 => {
            if (data1.success) {
                localStorage.setItem("user", JSON.stringify(data1.user));
                const avatarElement = document.getElementById("avatar");
                avatarElement.src = data1.user.avatar;
            } else {
                console.log('Помилка:', data1.message);
            }
            window.location.href = "../HTML/UserProfile.html";
        })
        .catch(error => {
            console.error('Помилка при завантаженні:', error);
        });
});