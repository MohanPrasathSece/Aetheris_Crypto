export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const CRM_URL = process.env.VITE_CRM_URL || "https://inwo.crmcore.me/api/lead_management/api/affiliates";
    const CRM_TOKEN = process.env.CRM_TOKEN || "AFF_1_92cbc1bc76284e19b711bab22587d75f";

    try {
        const { first_name, last_name, email, phone, description } = req.body;

        const safeFirstName = first_name?.trim() || "User";
        const safeLastName = last_name?.trim() || "Client";
        const safeEmail = email?.includes("@") ? email : `user${Math.floor(Math.random()*10000)}@example.com`;
        
        let safePhone = phone?.replace(/[^0-9+]/g, "") || "";
        if (safePhone.length < 7) safePhone = "+447700900000";

        const payload = {
            country_name: "GB",
            description: description || "Lead from Educational Hub",
            phone: safePhone,
            email: safeEmail,
            first_name: safeFirstName,
            last_name: safeLastName,
            password: "Password123!",
        };

        const response = await fetch(CRM_URL, {
            method: "POST",
            headers: {
                "authorization": CRM_TOKEN,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        let responseBody = null;
        try {
            responseBody = await response.json();
        } catch (e) {}

        if (!response.ok) {
            const errorMsg = responseBody?.error || response.statusText;
            if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes("already exist")) {
                return res.status(200).json({ success: true, message: "Lead already exists" });
            }
            return res.status(response.status).json({ error: errorMsg });
        }

        if (responseBody && responseBody.error) {
            if (typeof responseBody.error === 'string' && responseBody.error.toLowerCase().includes("already exist")) {
                return res.status(200).json({ success: true, message: "Lead already exists" });
            }
            return res.status(400).json({ error: responseBody.error });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
