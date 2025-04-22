window.addEventListener("DOMContentLoaded", () => {
    // Отримуємо дані користувача з localStorage
    const userData = localStorage.getItem("user");

    if (userData) {
        // Розбираємо JSON
        const user = JSON.parse(userData);

        // Перевіряємо, чи є ключі name та avatar
        if (user && user.name) {
            // Вивести аватарку (перевірка, якщо avatar не null)
            const avatarElement = document.getElementById("avatar");
            avatarElement.src = user.avatar

            // Вивести ім’я користувача
            const nameElement = document.getElementById("userName");
            nameElement.textContent = user.name;

            const eboutMeElement = document.getElementById("aboutMe");
            eboutMeElement.textContent = user.aboutMe;
            loadRecipes();
        } else {
            // Якщо структура даних неправильна, переходимо на авторизацію
            window.location.href = "../HTML/Autorization.html";
        }
    } else {
        // Якщо дані користувача не знайдено, переходимо на сторінку авторизації
        window.location.href = "../HTML/Autorization.html";
    }
});

async function getResipes() {
    const response = await fetch("http://localhost:3000/recipes");
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result;
}
async function loadRecipes() {
    const results = await getResipes();
    allRecipes = results.recipes;
    renderLikeRecipes(allRecipes);
    console.log("завантаження");
}
function renderLikeRecipes(recipes) {
    const container = document.getElementById("recipes-container");
    container.innerHTML = ""; // 🔁 Очищення один раз на початку
    const userData = JSON.parse(localStorage.getItem("user"));

    recipes.forEach(recipe => {
        fetch(`http://localhost:3000/if-user-like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userData.id,
                recipeId: recipe.id,
            })
        })
            .then(res => res.json())
            .then(data => {
                const isLiked = data.isLiked;

                if (isLiked) {
                    const card = document.createElement("div");
                    card.className = "recipe-card";

                    let ingredientsTable = "<table><tr><th>Інгредієнт</th><th>Кількість</th></tr>";
                    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
                        for (let i = 0; i < recipe.ingredients.length; i++) {
                            try {
                                const ingredient = JSON.parse(recipe.ingredients[i]);
                                if (ingredient.name && ingredient.amount) {
                                    ingredientsTable += `<tr><td>${ingredient.name}</td><td>${ingredient.amount}</td></tr>`;
                                } else {
                                    ingredientsTable += `<tr><td colspan="2">Некоректний інгредієнт</td></tr>`;
                                }
                            } catch (error) {
                                ingredientsTable += `<tr><td colspan="2">Помилка при читанні інгредієнта</td></tr>`;
                            }
                        }
                    } else {
                        ingredientsTable += `<tr><td colspan="2">Інгредієнти відсутні або некоректні</td></tr>`;
                    }
                    ingredientsTable += "</table>";

                    const embedURL = convertYouTubeURL(recipe.videoURL);

                    const videoIframe = recipe.videoURL
                        ? `<iframe class="video" src="${embedURL}" title="YouTube video player" frameborder="0" allowfullscreen></iframe>`
                        : "";

                    card.innerHTML = `
            <img src="${recipe.photo}" alt="${recipe.name}" class="photo">
            <h3>${recipe.name}</h3>
            <p>${recipe.recipe || 'Опис відсутній'}</p>
            ${ingredientsTable}
            ${videoIframe}
            <img alt="like" class="like-button" id="like-button"> 
`;

                    const likeBtn = card.querySelector(".like-button");
                    likeBtn.src = "../resources/heart-like.png";
                    likeBtn.addEventListener("click", () => {
                        let like;
                        if (likeBtn.src.includes("resources/heart.png")) {
                            like = 1;
                            likeBtn.src = "../resources/heart-like.png";
                        } else if (likeBtn.src.includes("resources/heart-like.png")) {
                            like = -1;
                            likeBtn.src = "../resources/heart.png";
                        }

                        fetch('http://localhost:3000/update-recipes-likes', {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: recipe.id,
                                like: like
                            })
                        })
                            .then(res => res.json())
                            .then(data => {
                                console.log("Сервер відповів:", data);
                            })
                            .catch(err => {
                                console.error("Помилка оновлення лайків:", err);
                            });

                        fetch('http://localhost:3000/add-user-recipe', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                userId: userData.id,
                                recipeId: recipe.id,
                                like: like
                            })
                        })
                            .then(res => res.json())
                            .then(data => {
                                console.log("Сервер відповів:", data);
                            })
                            .catch(err => {
                                console.error("Помилка оновлення лайків:", err);
                            });
                    });
                    container.appendChild(card);
                }
            });
    });
}

function convertYouTubeURL(url) {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w\-]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}


document.getElementById("avatar").addEventListener("click", function () {
    document.getElementById("fileInput").click()
})
document.getElementById("outBtn").addEventListener("click", function () {
    localStorage.removeItem("user");
    window.location.href = "../HTML/Autorization.html";
})
document.getElementById("settingBtn").addEventListener("click", function () {
    window.location.href = "../HTML/Settings.html";
})
document.getElementById('fileInput').addEventListener('change', function(event) {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) return;
    const formData = new FormData();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;  // Отримуємо userId з об'єкта
    if (user) {
        console.log("User ID:", userId);
    } else {
        console.log("Користувач не знайдений в localStorage");
    }

    formData.append('avatar', fileInput); // fileInput — це ваш input типу "file"
    formData.append('userId', userId ); // ID користувача

    fetch('http://localhost:3000/upload-avatar', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Аватар оновлено:', data.avatarUrl);
                // Ви можете оновити аватар на фронтенді
                localStorage.setItem("user", JSON.stringify(data.user));
                const avatarElement = document.getElementById("avatar");
                avatarElement.src = user.avatar
            } else {
                console.log('Помилка:', data.message);
            }
        })
        .catch(error => {
            console.error('Помилка при завантаженні:', error);
        });
});
