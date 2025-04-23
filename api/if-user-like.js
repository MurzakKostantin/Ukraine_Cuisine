import { supabase } from "../lib/supabaseClient"; // Шлях до твого supabase клієнта

export default async function ifUserLike(req, res) {
    const { userId, recipeId } = req.body;

    if (!userId || !recipeId) {
        return res.status(400).json({ success: false, message: "userId та recipeId обов'язкові" });
    }

    try {
        const { data: favorites, error } = await supabase
            .from("favorites")
            .select("userId, recipeId")
            .eq("userId", userId)
            .eq("recipeId", recipeId);

        if (error) {
            throw error;
        }

        const isLiked = favorites.length > 0;

        return res.json({ success: true, isLiked });

    } catch (err) {
        console.error("❌ Помилка при перевірці лайку:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
}