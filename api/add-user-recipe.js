import { supabase } from "../lib/supabaseClient"; // адаптуй шлях за потреби

export default async function addUserRecipe(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Метод не дозволений" });
    }

    try {
        console.log("Запит отримано:", req.body);

        const { userId, recipeId, like } = req.body;

        if (!userId || !recipeId || typeof like !== "number") {
            return res.status(400).json({ success: false, message: "Неправильні дані" });
        }

        if (like === 1) {
            const { error } = await supabase
                .from("favorites")
                .insert([{ userId, recipeId }]);

            if (error) throw error;
        } else if (like === -1) {
            const { error } = await supabase
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
}