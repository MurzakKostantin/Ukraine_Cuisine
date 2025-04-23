import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
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
            }])
            .select("id");

        if (error || !data || data.length === 0) {
            console.error("Помилка при додаванні користувача:", error);
            return res.status(500).json({ success: false, message: "Помилка при додаванні користувача", error });
        }

        // Отримуємо користувача з бази
        const { data: dataUser, error: findError1 } = await supabase
            .from("ukraine-cuisine-users")
            .select("id, email, password, avatar, name, aboutMe")
            .eq("email", email)
            .single();

        if (findError1) {
            return res.status(500).json({ success: false, message: 'Помилка при отриманні користувача', error: findError1 });
        }

        return res.status(200).json({
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
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
}