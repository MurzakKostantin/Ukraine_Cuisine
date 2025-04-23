import { supabase } from '../lib/supabaseClient'
import multer from 'multer';

// Налаштування multer для обробки multipart/form-data
const upload = multer();

export const config = {
    api: {
        bodyParser: false, // Вимикаємо Next.js body parser для підтримки multer
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // Обробляємо multipart/form-data за допомогою multer
    upload.single('avatar')(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Помилка обробки файлу', error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Будь ласка, завантажте файл.' });
        }

        const { file } = req;
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Не вказано userId.' });
        }

        try {
            // Очистка назви файлу від небезпечних символів
            const safeFileName = file.originalname
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9._-]/g, "_")
                .toLowerCase();

            const fileName = `${userId}_${Date.now()}_${safeFileName}`;

            // Завантаження файлу до Supabase Storage
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

            const avatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl;

            // Оновлення URL аватара в базі даних
            const { error: updateError } = await supabase
                .from("ukraine-cuisine-users")
                .update({ avatar: avatarUrl })
                .eq("id", userId);

            if (updateError) {
                throw new Error(`Не вдалося оновити аватар у базі: ${updateError.message}`);
            }

            // Отримання оновлених даних користувача
            const { data: userData, error: fetchError } = await supabase
                .from("ukraine-cuisine-users")
                .select("id, name, email, avatar, aboutMe")
                .eq("id", userId)
                .single();

            if (fetchError) {
                throw new Error(`Помилка при отриманні даних користувача: ${fetchError.message}`);
            }

            return res.status(200).json({
                success: true,
                message: "Аватар успішно завантажено та оновлено.",
                avatarUrl,
                user: userData,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    });
}