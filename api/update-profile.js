import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { userId, name, email, aboutMe } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: "userId обов'язковий" });
    }

    const updateData = {};
    if (name?.trim()) updateData.name = name;
    if (email?.trim()) updateData.email = email;
    if (aboutMe?.trim()) updateData.aboutMe = aboutMe;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: "Жодне поле не заповнено для оновлення" });
    }

    try {
        const { error: updateError } = await supabase
            .from("ukraine-cuisine-users")
            .update(updateData)
            .eq("id", userId);

        if (updateError) {
            console.error("Помилка оновлення даних:", updateError);
            return res.status(500).json({ success: false, message: "Не вдалося оновити дані профілю" });
        }

        const { data: userData, error: fetchError } = await supabase
            .from("ukraine-cuisine-users")
            .select("id, name, email, avatar, aboutMe")
            .eq("id", userId)
            .single();

        if (fetchError || !userData) {
            console.error("Помилка при отриманні даних користувача:", fetchError);
            return res.status(500).json({ success: false, message: "Не вдалося отримати оновлені дані користувача" });
        }

        return res.status(200).json({
            success: true,
            message: "Дані профілю успішно оновлено.",
            user: userData,
        });

    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ success: false, message: "Помилка сервера" });
    }
}