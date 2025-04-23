import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Метод не дозволено' });
    }

    try {
        const { data, error } = await supabase
            .from("ukraine-cuisine-cuisine")
            .select("*");

        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, recipes: data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}