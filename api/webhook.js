export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        console.log("Corpo recebido do Resend:", JSON.stringify(req.body));

        // O Resend pode enviar o remetente como 'from' (string) ou dentro de um objeto
        const bodyData = req.body.data || req.body;
        
        const fromEmail = typeof bodyData.from === 'string' ? bodyData.from : (bodyData.from?.email || 'Desconhecido');
        const subjectText = bodyData.subject || '(Sem assunto)';
        const bodyText = bodyData.text || bodyData.html || '';

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        const response = await fetch(`${supabaseUrl}/rest/v1/emails`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                from_email: fromEmail,
                subject: subjectText,
                body: bodyText
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error("ERRO detalhado do Supabase:", errData);
            return res.status(400).json({ error: errData });
        }

        console.log("E-mail salvo com sucesso!");
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("ERRO NO WEBHOOK:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
