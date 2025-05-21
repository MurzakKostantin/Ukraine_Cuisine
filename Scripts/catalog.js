let allRecipes = [];

addEventListener("DOMContentLoaded", loadRecipes);

async function getResipes() {
    const response = await fetch("https://ukraine-cuisine.vercel.app/api/recipes");
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result;
}

async function loadRecipes() {
    const results = await getResipes();
    allRecipes = results.recipes;
    renderRecipes(allRecipes);
    console.log("завантаження");
}

function renderRecipes(recipes) {
    const container = document.getElementById("recipes-container");
    container.innerHTML = "";

    recipes.forEach(recipe => {
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
        let isLiked;
        const userData =  JSON.parse(localStorage.getItem("user"));
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
        if(localStorage.getItem("user")){
            fetch(`https://ukraine-cuisine.vercel.app/api/if-user-like`,  {
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
                    isLiked = data.isLiked;
                    if (isLiked) {
                        likeBtn.src = "../resources/heart-like.png";
                    } else {
                        likeBtn.src = "../resources/heart.png";
                    }
                });
            likeBtn.addEventListener("click", () => {
                let like;

                    if(likeBtn.src.includes("resources/heart.png"))
                    {
                        like=1;
                        likeBtn.src = "../resources/heart-like.png";
                    }
                    else if(likeBtn.src.includes("resources/heart-like.png"))
                    {
                        like=-1;
                        likeBtn.src = "../resources/heart.png";
                    }

                    fetch('https://ukraine-cuisine.vercel.app/api/update-recipes-likes', {
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

                    fetch('https://ukraine-cuisine.vercel.app/api/add-user-recipe', {
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
        }
        else {
            likeBtn.src = "../resources/heart.png";
            likeBtn.addEventListener("click", () => {window.location.href = "../HTML/Autorization.html";});
        }

        container.appendChild(card);
    });
}

function convertYouTubeURL(url) {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w\-]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

document.getElementById("sort").addEventListener("change", function (e) {
    const selectedSort = e.target.value;
    if (selectedSort) {
        sortRecipes(selectedSort);
    }
});

function sortRecipes(type) {
    const sorted = [...allRecipes];

    switch (type) {
        case "id-asc":
            sorted.sort((a, b) => b.id - a.id);
            break;
        case "id-desc":
            sorted.sort((a, b) => a.id - b.id);
            break;
        case "likes-asc":
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        default:
            return;
    }
    renderRecipes(sorted);
    console.log("сортування");
}
document.getElementById("searchBtn").addEventListener("click", function (e) {
    const searchWord = document.getElementById("search").value.toLowerCase();
    const filtered = allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchWord)
    );
    renderRecipes(filtered);


});
