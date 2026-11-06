export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const payload = req.body;
        
        // 1. Extrai o "envelope" do e-mail
        const emailData = payload.data;
        if (!emailData || !emailData.email_id) {
            return res.status(400).json({ error: 'Payload vazio ou sem ID' });
        }

        const from_email = emailData.from;
        const subject = emailData.subject;
        const to_email = emailData.to ? emailData.to[0] : 'contato@vinnero.com.br';
        
        // 2. O Segredo: Busca o corpo real da mensagem no Resend usando o ID
        const resendKey = process.env.RESEND_API_KEY;
        const fetchContent = await fetch(`https://api.resend.com/emails/${emailData.email_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        const fullEmail = await fetchContent.json();
        // Agora sim temos acesso ao HTML ou Texto puro do e-mail
        const bodyContent = fullEmail.html || fullEmail.text || '(Mensagem vazia ou ilegível)';

        // 3. Salva no Supabase (já com o texto correto)
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
        console.error("Erro no Webhook:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
