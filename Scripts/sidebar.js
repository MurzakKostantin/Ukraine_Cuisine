document.addEventListener("DOMContentLoaded", function () {
    // Отримуємо кнопки за їхніми ID
    const userProfileBtn = document.getElementById("UserProfile");
    const recipeBtn = document.getElementById("Recipe");
    const historyBtn = document.getElementById("History");
    const img = document.getElementById("logo");
    const newRecipeBtn = document.getElementById("newRecipeBtn");

    img.addEventListener("click", function () {
        window.location.href = "../HTML/Main.html";
    });
    // Додаємо обробники подій для кнопок
    userProfileBtn.addEventListener("click", function () {
        window.location.href = "../HTML/UserProfile.html"; // Перехід на сторінку профілю
    });
    recipeBtn.addEventListener("click", function () {
        window.location.href = "../HTML/Catalog.html";
    });
    historyBtn.addEventListener("click", function () {
        window.location.href = "../HTML/History.html";
    });
    newRecipeBtn.addEventListener("click", function () {
        window.location.href = "../HTML/NewRecipePage.html";
    });
});