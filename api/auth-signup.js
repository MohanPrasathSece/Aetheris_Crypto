import { put, get } from '@vercel/blob';

// Helper to fetch the current users DB from Blob
async function getUsersDB() {
    try {
        const result = await get('users.json', { access: 'private' });
        return await new Response(result.stream).json();
    } catch (error) {
        console.error("Error reading Blob DB:", error);
        return { users: [] };
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { first_name, last_name, email, phone } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // 1. Read Blob DB
        const db = await getUsersDB();

        // 2. Check if user exists
        if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ error: 'Email already registered in the Node Network.' });
        }

        // 3. Update DB
        db.users.push({ 
            email: email.toLowerCase(), 
            name: `${first_name} ${last_name}`.trim(),
            created_at: new Date().toISOString() 
        });

        // 4. Write back to Blob (overwrite)
        await put('users.json', JSON.stringify(db), {
            access: 'private',
            addRandomSuffix: false, // Overwrite the exact file
            allowOverwrite: true
        });

        // 5. Submit to CRM
        const CRM_URL = process.env.VITE_CRM_URL || "https://inwo.crmcore.me/api/lead_management/api/affiliates";
        const CRM_TOKEN = process.env.CRM_TOKEN || "AFF_1_92cbc1bc76284e19b711bab22587d75f";

        const safeFirstName = first_name?.trim() || "User";
        const safeLastName = last_name?.trim() || "Client";
        let safePhone = phone?.replace(/[^0-9+]/g, "") || "";
        if (safePhone.length < 7) safePhone = "+447700900000";

        const payload = {
            country_name: "GB",
            description: "Lead from Educational Hub Signup",
            phone: safePhone,
            email: email.toLowerCase(),
            first_name: safeFirstName,
            last_name: safeLastName,
            password: "Password123!",
        };

        const crmResponse = await fetch(CRM_URL, {
            method: "POST",
            headers: {
                "authorization": CRM_TOKEN,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        // Even if CRM fails, we treat signup as success since they are in our Blob DB
        // But we log it
        if (!crmResponse.ok) {
            console.error("CRM Sync failed during signup", await crmResponse.text().catch(()=>''));
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Signup Handler Error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
