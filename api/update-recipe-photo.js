import nextConnect from 'next-connect';
import multer from 'multer';
import { supabase } from '../lib/supabaseClient';

export const config = {
    api: {
        bodyParser: false,
    },
};

const upload = multer({
    storage: multer.memoryStorage(),
});

const apiRoute = nextConnect();

apiRoute.use(upload.single('recipe-photo'));

apiRoute.post(async (req, res) => {
    const file = req.file;
    const name = req.body.name;

    if (!file) {
        return res.status(400).json({ success: false, message: "Будь ласка, завантажте файл." });
    }

    if (!name) {
        return res.status(400).json({ success: false, message: "Не вказано назву рецепту." });
    }

    try {
        const safeFileName = file.originalname
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .toLowerCase();

        const fileName = `${Date.now()}_${safeFileName}`;

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

        const photoUrl = supabase.storage
            .from("recipe-photo")
            .getPublicUrl(fileName).data.publicUrl;

        const { error: updateError } = await supabase
            .from("ukraine-cuisine-cuisine")
            .update({ photo: photoUrl })
            .eq("name", name);

        if (updateError) {
            throw new Error(`Не вдалося оновити фото у базі: ${updateError.message}`);
        }

        const { data: recipeData, error: fetchError } = await supabase
            .from("ukraine-cuisine-cuisine")
            .select("id, name")
            .eq("name", name)
            .single();

        if (fetchError || !recipeData) {
            return res.status(500).json({ success: false, message: "Не вдалося знайти оновлений рецепт" });
        }

        res.json({
            success: true,
            message: "Фото рецепту успішно завантажено та оновлено.",
            recipeId: recipeData.id,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default apiRoute;