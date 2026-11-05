export default async function handler(req, res) {
    // Bloqueia se não for um envio do Resend (POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // O Resend envia os dados da mensagem no corpo da requisição
        const { from, subject, text } = req.body;

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        // Salva a mensagem direto na sua tabela 'emails' no Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/emails`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                from_email: from,
                subject: subject,
                body: text
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar no banco de dados');
        }

        // Retorna sucesso para o Resend saber que a mensagem foi recebida e salva
        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
