export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const CRM_URL = process.env.VITE_CRM_URL || "https://inwo.crmcore.me/api/lead_management/api/affiliates";
    const CRM_TOKEN = process.env.CRM_TOKEN || "AFF_1_92cbc1bc76284e19b711bab22587d75f";

    try {
        const leadData = req.body;

        const [first_name, ...lastNameParts] = (leadData.name || leadData.first_name || "Unknown").trim().split(" ");
        const safeFirstName = first_name || "User";
        const last_name = lastNameParts.length > 0 ? lastNameParts.join(" ") : "Lead";
        const email = leadData.email?.includes("@") ? leadData.email : `user${Math.floor(Math.random()*10000)}@example.com`;
        
        let phone = (leadData.number || leadData.phone || "").replace(/[^0-9+]/g, '');
        if (phone) {
            if (phone.startsWith('+')) {
                phone = '00' + phone.slice(1);
            }
            if (phone.startsWith('41') && phone.length === 11) {
                phone = '00' + phone;
            }
            if (!phone.startsWith('0041')) {
                if (phone.startsWith('0') && !phone.startsWith('00')) {
                    phone = '0041' + phone.slice(1);
                } else if (!phone.startsWith('00')) {
                    phone = '0041' + phone;
                }
            }
        } else {
            phone = "0000000000";
        }

        const message = leadData.message || leadData.description;
        const description = message || "Signup Lead";

        const payload = {
            country_name: "ch",
            description: description,
            phone: phone,
            email: email,
            first_name: safeFirstName,
            last_name: last_name,
            custom_fields: {
                Source_ID: "website",
                How_Much_Invested: leadData.amount || "0",
                Outline_Your_Case: message || ""
            }
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
        
        try {
            const url = (typeof process !== 'undefined' && process.env && process.env.VITE_DASHBOARD_URL) || "https://autodigix-leads-dashboard.vercel.app/api/increment";
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ website: "Aetheris", type: description && description !== "Signup Lead" ? "contact" : "signup", name: safeFirstName + " " + last_name, email: email })
            }).catch(() => {});
        } catch(e) {}

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
