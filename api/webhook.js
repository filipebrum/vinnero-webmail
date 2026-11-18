export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const payload = req.body;
        const emailData = payload.data;

        if (!emailData || !emailData.email_id) {
            return res.status(400).json({ error: 'Payload vazio ou sem ID' });
        }

        const from_email = emailData.from || 'Desconhecido';
        const subject = emailData.subject || '(Sem assunto)';
        const to_email = (emailData.to && emailData.to[0]) ? emailData.to[0] : 'contato@vinnero.com.br';

        // 1. Busca o texto real na rota correta de e-mails RECEBIDOS do Resend
        const resendKey = process.env.RESEND_API_KEY;
        const fetchContent = await fetch(`https://api.resend.com/emails/receiving/${emailData.email_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            }
        });

        let bodyContent = '(Não foi possível ler o corpo do e-mail)';
        if (fetchContent.ok) {
            const fullEmail = await fetchContent.json();
            bodyContent = fullEmail.text || fullEmail.html || '(Mensagem sem texto)';
        }

        // 2. Salva no Supabase usando a chave privada (Service Role)
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
        console.error("Erro no Webhook:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
