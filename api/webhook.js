export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { from, subject, text } = req.body;

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Variáveis de ambiente do Supabase não configuradas na Vercel');
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/emails`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                from_email: from || 'Desconhecido',
                subject: subject || '(Sem assunto)',
                body: text || ''
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            throw new Error('Erro ao salvar no Supabase: ' + errData);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
