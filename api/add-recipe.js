import { supabase } from '../lib/supabaseClient'
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Метод не дозволено' });
    }

    const { name, recipe, ingredients, videoURL } = req.body;

    if (!name || !recipe || !ingredients) {
        return res.status(400).json({ success: false, message: "Усі поля, крім відео, є обов'язковими." });
    }

    try {
        // Перевірка на існування страви з такою назвою
        const { data: existingRecipe, error: findError } = await supabase
            .from("ukraine-cuisine-cuisine")
            .select("name")
            .eq("name", name)
            .single();

        if (existingRecipe) {
            return res.status(400).json({ success: false, message: "Така страва вже є!" });
        }

        const { data, error } = await supabase
            .from("ukraine-cuisine-cuisine")
            .insert([{
                name,
                recipe,
                ingredients,
                videoURL,
            }])
            .select("id");

        if (error || !data || data.length === 0) {
            console.error("Помилка при додаванні рецепта:", error);
            return res.status(500).json({ success: false, message: "Помилка при додаванні рецепта", error });
        }

        res.status(200).json({
            success: true,
            message: "Рецепт успішно додано",
            recipe: {
                recipeId: data[0].id,
            },
        });

    } catch (err) {
        console.error("Помилка сервера:", err);
        res.status(500).json({ success: false, message: err.message });
    }
}