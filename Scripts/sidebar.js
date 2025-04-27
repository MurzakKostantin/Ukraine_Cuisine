document.addEventListener("DOMContentLoaded", function () {
    // Отримуємо кнопки за їхніми ID
    const userProfileBtn = document.getElementById("UserProfile");
    const recipeBtn = document.getElementById("Recipe");
    const historyBtn = document.getElementById("History");
    const img = document.getElementById("logo");
    const newRecipeBtn = document.getElementById("newRecipeBtn");
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
    const sidebar = document.querySelector(".sidebar");
    userProfileBtn.addEventListener("click", function () {
            window.location.href = "../HTML/UserProfile.html";
    });

    img.addEventListener("click", function () {
        window.location.href = "../HTML/Main.html";
    });

    recipeBtn.addEventListener("click", function () {
        window.location.href = "../HTML/Catalog.html";

    });
    historyBtn.addEventListener("click", function () {
        window.location.href = "../HTML/History.html";
    });
    toggleSidebarBtn.addEventListener("click", function () {
        if (sidebar) {
                sidebar.classList.toggle("hidden");
                document.body.classList.toggle('hidden');
                toggleSidebarBtn.classList.toggle("hidden");
        } else {
            console.error("Sidebar element not found!");
        }
    });
    newRecipeBtn.addEventListener("click", function () {
        window.location.href = "../HTML/NewRecipePage.html";
    });


});