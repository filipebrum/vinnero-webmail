export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const payload = req.body;
        const emailData = payload.data || payload;

        const from_email = emailData.from || 'desconhecido';
        const subject = emailData.subject || 'Sem assunto';
        const to_email = (emailData.to && emailData.to[0]) ? emailData.to[0] : 'contato@vinnero.com.br';

        // Tática de investigação: Se não encontrar o texto nos campos padrão, converte o pacote inteiro em texto
        const bodyContent = emailData.text || emailData.html || payload.text || payload.html || JSON.stringify(payload, null, 2);

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        await fetch(`${supabaseUrl}/rest/v1/emails`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                from_email: from_email,
                to_email: to_email,
                subject: subject,
                body: bodyContent
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
