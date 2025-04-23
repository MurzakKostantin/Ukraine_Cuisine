export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    const { data, error } = await supabase
        .from('ukraine-cuisine-users')
        .select('id, email, password, avatar, name, aboutMe')
        .eq('email', email)
        .single();

    if (error || !data) {
        return res.json({ success: false, message: 'Користувача не знайдено' });
    }

    if (password !== data.password) {
        return res.json({ success: false, message: 'Невірний пароль' });
    }

    return res.json({
        success: true,
        user: {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            aboutMe: data.aboutMe,
        },
    });
}