export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { to, subject, body } = req.body;
        const resendKey = process.env.RESEND_API_KEY;
        const supabaseUrl = process.env.SUPABASE_URL; // Precisa estar nas variáveis da Vercel
        const supabaseKey = process.env.SUPABASE_ANON_KEY; // Precisa estar nas variáveis da Vercel

        if (!resendKey) return res.status(500).json({ error: 'Chave do Resend ausente.' });

        // 1. Envia a mensagem pelo Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Vinnero <contato@vinnero.com.br>',
                to: [to],
                subject: subject,
                text: body
            })
        });

        if (!resendResponse.ok) throw new Error(await resendResponse.text());

        // 2. Salva a cópia na tabela "emails" do Supabase
        if (supabaseUrl && supabaseKey) {
            await fetch(`${supabaseUrl}/rest/v1/emails`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    from_email: 'contato@vinnero.com.br',
                    to_email: to,
                    subject: subject,
                    body: body
                })
            });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
