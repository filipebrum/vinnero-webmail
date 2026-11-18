export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Credenciais do Supabase ausentes.' });
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/emails?select=*&order=created_at.desc`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
