window.addEventListener('scroll', function() {
    let parallax = document.getElementById('parallax');
    let offset = window.pageYOffset;
    parallax.style.backgroundPositionY = offset * 0.8 + 'px'; // 0.5 - коэффициент для параллакса
});

function removeOnRecipe(name)
{
    const catalogWindow = window.open('../HTML/Catalog.html', '_blank');

    catalogWindow.onload = function () {
        // Інколи не спрацьовує для нових вікон (через політики браузера),
        // тому краще дочекатися через "setInterval"
    };

    const interval = setInterval(function () {
        if (catalogWindow.document && catalogWindow.document.readyState === 'complete') {
            const input = catalogWindow.document.getElementById('search');
            const searchButton = catalogWindow.document.getElementById('searchBtn');

            if (input && searchButton) {
                input.value = name;

                // Якщо кнопка — <button> або має слухача
                searchButton.click();

                // Якщо кнопка у формі:
                // catalogWindow.document.getElementById('searchForm').submit();

                clearInterval(interval);
            }
        }
    }, 300); // Перевіряємо кожні 300 мс
}

document.getElementById('crimea').onclick = function () {
    removeOnRecipe("шурпа");
};
document.getElementById('zakarpattia').onclick = function () {
    removeOnRecipe("Бограч");
};
document.getElementById('lvivska').onclick = function () {
    removeOnRecipe("Львівський сирник");
};
document.getElementById('ivanofrankivska').onclick = function () {
    removeOnRecipe("Банош");
};
document.getElementById('ternopilska').onclick = function () {
    removeOnRecipe("Крученики по-тернопільськи");
};
document.getElementById('chernivetska').onclick = function () {
    removeOnRecipe("Буковинські голубці");
};
document.getElementById('volynska').onclick = function () {
    removeOnRecipe("Кулеша");
};
document.getElementById('rivnenska').onclick = function () {
    removeOnRecipe("Тетеря");
};
document.getElementById('khmelnytska').onclick = function () {
    removeOnRecipe("Гречаники");
};
document.getElementById('vinnytska').onclick = function () {
    removeOnRecipe("Годзя");
};
document.getElementById('zhytomyrska').onclick = function () {
    removeOnRecipe("Штруханці");
};
document.getElementById('kyivska').onclick = function () {
    removeOnRecipe("Котлети по-київськи");
};document.getElementById('chernihivska').onclick = function () {
    removeOnRecipe("Качана каша");
};document.getElementById('sumska').onclick = function () {
    removeOnRecipe("Лемішка");
};
document.getElementById('poltavska').onclick = function () {
    removeOnRecipe("Галушки");
};
document.getElementById('cherkaska').onclick = function () {
    removeOnRecipe("Верещака");
};
document.getElementById('kirovohradska').onclick = function () {
    removeOnRecipe("Картопля по-селянськи");
};
document.getElementById('dnipropetrovska').onclick = function () {
    removeOnRecipe("Затірка");
};
document.getElementById('kharkivska').onclick = function () {
    removeOnRecipe("Слобожанський борщ");
};
document.getElementById('luhanska').onclick = function () {
    removeOnRecipe("шахтарський торт");
};
document.getElementById('donetska').onclick = function () {
    removeOnRecipe("Штрулі");
};
document.getElementById('zaporizka').onclick = function () {
    removeOnRecipe("Капусняк");
};
document.getElementById('khersonska').onclick = function () {
    removeOnRecipe("Уха по-херсонськи");
};
document.getElementById('mikolayivska').onclick = function () {
    removeOnRecipe("Товченики по-вітовськи");
};
document.getElementById('odeska').onclick = function () {
    removeOnRecipe("Мамалига з бринзою по-бессарабськи");
};

