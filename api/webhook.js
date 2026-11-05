export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        console.log("Payload completo do Res:", JSON.stringify(req.body));

        // O Resend Inbound costuma mandar os dados dentro de data ou no próprio body
        const payload = req.body.data || req.body;

        // Varre todas as variações possíveis onde o Resend pode colocar as informações
        const fromEmail = payload.from || payload.sender || payload.from_email || payload.data?.from || 'Desconhecido';
        const subjectText = payload.subject || payload.data?.subject || '(Sem assunto)';
        const bodyText = payload.text || payload.html || payload.body || payload.data?.text || payload.data?.html || JSON.stringify(req.body);

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/emails`, {
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
            console.error("Erro Supabase:", errData);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erro webhook:", error.message);
        return res.status(200).json({ success: true });
    }
}
