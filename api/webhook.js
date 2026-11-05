export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        console.log("Webhook recebido - Body bruto:", JSON.stringify(req.body));

        // Trata diferentes estruturas de payload que o Resend/Svix podem enviar
        const payload = req.body.data || req.body;

        const fromEmail = payload.from || payload.sender || payload.from_email || 'Desconhecido';
        const subjectText = payload.subject || '(Sem assunto)';
        const bodyText = payload.text || payload.html || payload.body || '';

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Variáveis de ambiente do Supabase ausentes');
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
                from_email: String(fromEmail),
                subject: String(subjectText),
                body: String(bodyText)
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error("Erro retornado pelo Supabase:", errData);
            return res.status(400).json({ success: false, error: errData });
        }

        console.log("E-mail salvo com sucesso no Supabase!");
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Erro interno no webhook:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
