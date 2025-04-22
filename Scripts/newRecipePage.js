function addRow() {
    event.preventDefault();
    let table = document.getElementById("dynamic-table").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);


    cell1.contentEditable = "true";
    cell2.contentEditable = "true";
}

const textarea = document.getElementById("recipe-recipe");
textarea.addEventListener("input", autoResize);
function autoResize() {
    this.style.height = "auto"; // скидаємо попередню висоту
    this.style.height = (this.scrollHeight) + "px"; // встановлюємо нову
}

document.getElementById("submit").addEventListener("click", async function(event) {
    event.preventDefault();

    const name = document.getElementById("recipe-name").value;
    const recipe = document.getElementById("recipe-recipe").value;
    const videoURL = document.getElementById("recipe-video").value;
    const ingredients = [];

    const table = document.getElementById("dynamic-table");
    const rows = table.querySelectorAll("tbody tr");
    // проходимося по кожному рядку
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const name = cells[0]?.innerText.trim();
        const amount = cells[1]?.innerText.trim();

        if (name || amount) {
            ingredients.push({ name, amount });
        }
    });

    const fileInput = document.getElementById('recipe-photo').files[0];

    fetch('http://localhost:3000/add-recipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            recipe,
            videoURL,
            ingredients,
        })

    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Рецепт додано');
                if (!fileInput){
                    return
                }
                const formData =  new FormData();
                formData.append('recipe-photo', fileInput); // fileInput — це ваш input типу "file"
                formData.append('name',name);
                //
                fetch('http://localhost:3000/update-recipe-photo', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data1 => {
                        if (data1.success) {
                            console.log('Фото оновлено:', data1.id);
                        } else {
                            console.log('Помилка:', data1.message);
                        }
                        window.location.href = "../HTML/Catalog.html";
                    })
                    .catch(error => {
                        console.error('Помилка при завантаженні:', error);
                    });
            } else {
                console.log('Помилка:', data.message);
            }
        })
        .catch(error => {
            console.error('Помилка при завантаженні:', error);
        });



});

