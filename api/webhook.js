export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        console.log("Payload bruto recebido do Resend/Svix:", JSON.stringify(req.body));

        // O Resend/Svix envia o evento encapsulado em .data ou diretamente no body
        const eventData = req.body.data || req.body;
        
        // Extrai os campos considerando o formato padrão do Resend Inbound
        const fromEmail = eventData.from || eventData.sender || 'Desconhecido';
        const subjectText = eventData.subject || '(Sem assunto)';
        const bodyText = eventData.text || eventData.html || eventData.body || '';

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Variáveis do Supabase ausentes na Vercel');
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
            console.error("Erro ao salvar no Supabase:", errData);
            return res.status(400).json({ error: errData });
        }

        console.log("E-mail recebido e salvo com sucesso!");
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Exceção fatal no webhook:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
