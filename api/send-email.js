export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { to, subject, body } = req.body;
        const resendKey = process.env.RESEND_API_KEY;

        if (!resendKey) {
            return res.status(500).json({ error: 'Chave do Resend não encontrada na Vercel.' });
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Vinnero <contato@vinnero.com.br>', // Tem que ser exatamente o e-mail verificado
                to: [to],
                subject: subject,
                text: body
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error("Erro no Resend:", errData);
            return res.status(400).json({ error: errData });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erro no send-email:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
