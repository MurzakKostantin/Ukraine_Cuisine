import { supabase } from '../lib/supabaseClient'
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { email, password } = req.body;

        const { data, error } = await supabase
            .from('ukraine-cuisine-users')
            .select('id, email, password, avatar, name, aboutMe')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Користувача не знайдено' });
        }

        if (password !== data.password) {
            return res.status(401).json({ success: false, message: 'Невірний пароль' });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                aboutMe: data.aboutMe,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
}