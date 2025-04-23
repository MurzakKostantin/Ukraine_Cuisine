router.post("/login", async (req, res) => {
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