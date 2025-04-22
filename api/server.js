const express = require("express");
const router = express.Router();
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");


const app = express();
const PORT  = 3000;

app.use(cors());
app.use(express.json());

// Налаштування Multer для збереження файлів
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

require("dotenv").config();

const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

// Логін користувача
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Отримуємо користувача з бази
    const { data, error } = await supabase
        .from("ukraine-cuisine-users")
        .select("id, email, password, avatar, name, aboutMe")  // Додаємо поле avatar
        .eq("email", email)
        .single();

    if (error || !data) {
        return res.json({ success: false, message: "Користувача не знайдено" });
    }

    // Перевірка пароля
    if (password !== data.password) {
        return res.json({ success: false, message: "Невірний пароль" });
    }

    // Повертати дані користувача
    res.json({
        success: true,
        user: {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            aboutMe: data.aboutMe
        },
    });
});

// Метод реєстрації користувача
app.post("/register", async (req, res) => {
    const { login, email, password } = req.body;

    // Перевірка, чи вже існує користувач з таким email
    const { data: existingUser, error: findError } = await supabase
        .from("ukraine-cuisine-users")
        .select("email")
        .eq("email", email)
        .single();

    if (existingUser) {
        return res.status(400).json({ success: false, message: "Такий email вже зареєстрований!" });
    }

    // Додаємо нового користувача до бази даних
    const { data, error } = await supabase
        .from("ukraine-cuisine-users")
        .insert([{
            name: login,
            email: email,
            password: password,
        }]) .select("id");  // Обираємо id для отримання;

    if (error || !data || data.length === 0) {
        console.error("Помилка при додаванні користувача:", error);
        return res.status(500).json({ success: false, message: "Помилка при додаванні користувача", error });
    }
    // Отримуємо користувача з бази
    const { data: dataUser, error: findError1 } = await supabase
        .from("ukraine-cuisine-users")
        .select("id, email, password, avatar, name, aboutMe")  // Додаємо поле avatar
        .eq("email", email)
        .single();

    res.json({
        success: true,
        message: "Реєстрація успішна",
        user: {
            id: dataUser.id,
            name: dataUser.name,
            email: dataUser.email,
            avatar: dataUser.avatar,
            aboutMe: dataUser.aboutMe,
        },
    });
});
app.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Будь ласка, завантажте файл." });
    }

    const { file } = req;
    const userId = req.body.userId;
    if (!userId) {
        return res.status(400).json({ success: false, message: "Не вказано userId." });
    }

    try {
        // Очистка назви файлу від небезпечних символів
        const safeFileName = file.originalname
            .normalize("NFD") // Нормалізація Unicode
            .replace(/[\u0300-\u036f]/g, "") // Видалення діакритичних знаків
            .replace(/[^a-zA-Z0-9._-]/g, "_") // Видалення пробілів та небезпечних символів
            .toLowerCase(); // Приведення до нижнього регістру

        const fileName = `${userId}_${Date.now()}_${safeFileName}`;

        // Завантажуємо файл в Supabase Storage
        const { data, error } = await supabase.storage
            .from("avatars")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
                upsert: true,
            });

        if (error) {
            throw new Error(`Помилка завантаження файлу: ${error.message}`);
        }

        // Отримання публічного URL
        const avatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;

        // Оновлення аватара у базі даних
        const { error: updateError } = await supabase
            .from("ukraine-cuisine-users")
            .update({ avatar: avatarUrl })
            .eq("id", userId);

        if (updateError) {
            throw new Error(`Не вдалося оновити аватар у базі: ${updateError.message}`);
        }

        const { data: userData, error: fetchError } = await supabase
            .from("ukraine-cuisine-users")
            .select("id, name, email, avatar, aboutMe")
            .eq("id", userId)
            .single();

        res.json({
            success: true,
            message: "Аватар успішно завантажено та оновлено.",
            avatarUrl: avatarUrl,
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                aboutMe: userData.aboutMe
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});
// Маршрут для оновлення даних користувача
app.post("/update-profile", async (req, res) => {
    const { userId, name, email, aboutMe } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: "userId обов'язковий" });
    }

    // Формуємо об'єкт тільки з тих полів, які не порожні
    const updateData = {};
    if (name && name.trim() !== "") updateData.name = name;
    if (email && email.trim() !== "") updateData.email = email;
    if (aboutMe && aboutMe.trim() !== "") updateData.aboutMe = aboutMe;

    // Якщо нічого не змінюється — можна пропустити оновлення
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: "Жодне поле не заповнено для оновлення" });
    }

    try {
        // Оновлення тільки наявних полів
        const { error: updateError } = await supabase
            .from("ukraine-cuisine-users")
            .update(updateData)
            .eq("id", userId);

        if (updateError) {
            console.error("Помилка оновлення даних:", updateError);
            return res.status(500).json({ success: false, message: "Не вдалося оновити дані профілю" });
        }

        // Отримуємо оновлені дані користувача
        const { data: userData, error: fetchError } = await supabase
            .from("ukraine-cuisine-users")
            .select("id, name, email, avatar, aboutMe")
            .eq("id", userId)
            .single();

        if (fetchError || !userData) {
            console.error("Помилка при отриманні даних користувача:", fetchError);
            return res.status(500).json({ success: false, message: "Не вдалося отримати оновлені дані користувача" });
        }

        res.json({
            success: true,
            message: "Дані профілю успішно оновлено.",
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                aboutMe: userData.aboutMe
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/update-recipe-photo", upload.single("recipe-photo"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Будь ласка, завантажте файл." });
    }

    const { file } = req;
    const name = req.body.name;  // Перевірка на назву рецепту

    if (!name) {
        return res.status(400).json({ success: false, message: "Не вказано назву рецепту." });  // Перевірка на наявність назви
    }

    try {
        // Очистка назви файлу від небезпечних символів
        const safeFileName = file.originalname
            .normalize("NFD") // Нормалізація Unicode
            .replace(/[\u0300-\u036f]/g, "") // Видалення діакритичних знаків
            .replace(/[^a-zA-Z0-9._-]/g, "_") // Видалення пробілів та небезпечних символів
            .toLowerCase(); // Приведення до нижнього регістру

        const fileName = `${Date.now()}_${safeFileName}`;

        // Завантажуємо файл в Supabase Storage
        const { data, error } = await supabase.storage
            .from("recipe-photo")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
                upsert: true,
            });
        if (error) {
            throw new Error(`Помилка завантаження файлу: ${error.message}`);
        }

        // Отримання публічного URL
        const photoUrl = supabase.storage.from("recipe-photo").getPublicUrl(fileName).data.publicUrl;

        // Оновлення аватара у базі даних
        const { error: updateError } = await supabase
            .from("ukraine-cuisine-cuisine")
            .update({ photo: photoUrl })
            .eq("name", name);  // Знаходимо за назвою

        if (updateError) {
            throw new Error(`Не вдалося оновити аватар у базі: ${updateError.message}`);
        }

        const { data: recipeData, error: fetchError } = await supabase
            .from("ukraine-cuisine-cuisine")
            .select("id, name")
            .eq("name", name)
            .single();

        res.json({
            success: true,
            message: "Аватар успішно завантажено та оновлено.",
            recipeId: recipeData.id,  // Повертаємо ID для зручності
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/add-recipe", async (req, res) => {
    const{name, recipe, ingredients, videoURL}=req.body;

    // Перевірка, чи вже існує користувач з таким email
    const { data: existingResipe, error: findError } = await supabase
        .from("ukraine-cuisine-cuisine")
        .select("name")
        .eq("name", name)
        .single();

    if (existingResipe) {
        return res.status(400).json({ success: false, message: "Така страва вже є!" });
    }

    const { data, error } = await supabase
        .from("ukraine-cuisine-cuisine")
        .insert([{
            name: name,
            recipe: recipe,
            videoURL: videoURL,
            ingredients: ingredients,
        }]) .select("id");  // Обираємо id для отримання;

    if (error || !data || data.length === 0) {
        console.error("Помилка при додаванні рецепта:", error);
        return res.status(500).json({ success: false, message: "Помилка при додаванні рецепта", error });
    }
    const { data: userData, error: fetchError } = await supabase
        .from("ukraine-cuisine-cuisine")
        .select("id, name")
        .eq("name", name)
        .single();

    res.json({
        success: true,
        message: "Реєстрація пецепта успішна",
        recipe: {
            recipeId: userData.id
        },
    });
});
app.get("/recipes", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("ukraine-cuisine-cuisine")
            .select("*");

        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }

        res.json({ success: true, recipes: data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
app.patch("/update-recipes-likes", async (req, res) => {
    const { id, like } = req.body;
const updatedLikes={};
    try {
        const {data: recipe, error: fetchError} = await supabase
            .from("ukraine-cuisine-cuisine")
            .select("id, likes")
            .eq("id", id)
            .single();
        if (fetchError || !recipe) {
            return res.status(404).json({success: false, message: "Рецепт не знайдено"});
        }

    updatedLikes.likes=recipe.likes+like;

    const { error: updateError } = await supabase
        .from("ukraine-cuisine-cuisine")
        .update({ likes: updatedLikes.likes })
        .eq("id",id );
        res.json({ success: true, updatedLikes });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
app.post("/add-user-recipe", async (req, res) => {
    try {
        console.log("Запит отримано:", req.body);

        const { userId, recipeId, like } = req.body;

        if (!userId || !recipeId || typeof like !== "number") {
            return res.status(400).json({ success: false, message: "Неправильні дані" });
        }

        if (like === 1) {
            const { data, error } = await supabase
                .from("favorites")
                .insert([{ userId: userId, recipeId: recipeId }]);

            if (error) throw error;
        } else if (like === -1) {
            const { data, error } = await supabase
                .from("favorites")
                .delete()
                .eq("userId", userId)
                .eq("recipeId", recipeId);

            if (error) throw error;
        }

        res.json({ success: true });

    } catch (err) {
        console.error("❌ ПОМИЛКА НА СЕРВЕРІ:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
app.post("/if-user-like",async(req, res) => {
    const { userId,recipeId  } = req.body;
    const { data:favorites, error } = await supabase
        .from("favorites")
        .select("userId, recipeId")
        .eq("userId", userId)
        .eq("recipeId", recipeId)

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
    const isLiked = favorites.length > 0;
    return res.json({ success: true, isLiked  });
})
// app.listen(PORT, () => {
//     console.log(`✅ Сервер запущено на http://localhost:${PORT}`);
// });
module.exports = (req, res) => {
    app(req, res);
};