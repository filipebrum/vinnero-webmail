export default async function handler(req, res) {
    // O Resend envia um POST para este webhook
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const payload = req.body;
        
        // O Resend encapsula os dados do e-mail dentro de "data"
        const emailData = payload.data;
        if (!emailData) return res.status(400).json({ error: 'Payload vazio' });

        // Extrai os campos corretamente (o Resend pode mandar o texto em 'html' ou 'text')
        const from_email = emailData.from;
        const subject = emailData.subject;
        const bodyContent = emailData.html || emailData.text || '(Mensagem sem texto)';
        const to_email = emailData.to ? emailData.to[0] : 'contato@vinnero.com.br';

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        // Guarda no Supabase
        const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/emails`, {
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

        if (!supabaseResponse.ok) {
            console.error("Erro ao guardar no Supabase:", await supabaseResponse.text());
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erro no Webhook:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
