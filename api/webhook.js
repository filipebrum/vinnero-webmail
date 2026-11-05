export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Mostra no log da Vercel o corpo exato que chegou
        console.log("BODY RECEBIDO:", JSON.stringify(req.body));

        const payload = req.body || {};
        const dataObj = payload.data || payload;

        // Tenta extrair de qualquer propriedade possível
        const fromEmail = dataObj.from || dataObj.sender || dataObj.from_email || payload.from || 'teste@resend.dev';
        const subjectText = dataObj.subject || payload.subject || 'E-mail de Teste';
        const bodyText = dataObj.text || dataObj.html || dataObj.body || JSON.stringify(payload);

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

        const responseText = await response.text();
        console.log("RESPOSTA SUPABASE:", response.status, responseText);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERRO FATAL NO WEBHOOK:", error.message);
        return res.status(200).json({ success: true });
    }
}
