export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        console.log("Recebendo webhook do Resend:", JSON.stringify(req.body));

        const { from, subject, text } = req.body;

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("ERRO: Variáveis do Supabase ausentes na Vercel!");
            throw new Error('Variáveis de ambiente do Supabase não configuradas');
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
            console.error("ERRO ao salvar no Supabase:", errData);
            throw new Error('Erro ao salvar no Supabase: ' + errData);
        }

        console.log("E-mail salvo com sucesso no Supabase!");
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("EXCEÇÃO NO WEBHOOK:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
