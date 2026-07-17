import { put, get, head } from '@vercel/blob';

const BLOB_KEY = 'aetheris_users.json';

// Helper to fetch the current users DB from Blob
async function getUsersDB() {
    try {
        let blobMeta;
        try {
            blobMeta = await head(BLOB_KEY);
        } catch (e) {
            return { users: [] };
        }
        
        if (blobMeta && blobMeta.url) {
            const result = await get(blobMeta.url, { access: 'private' });
            if (result && result.stream) {
                return await new Response(result.stream).json();
            }
        }
        return { users: [] };
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
        const { name, email, number } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const [first_name, ...lastNameParts] = (name || "Unknown").trim().split(" ");
        const safeFirstName = first_name || "User";
        const last_name = lastNameParts.length > 0 ? lastNameParts.join(" ") : "";

        // 1. Read Blob DB
        const db = await getUsersDB();

        // 2. Check if user exists
        if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ error: 'Email already registered in the Node Network.' });
        }

        // 3. Update DB
        db.users.push({ 
            email: email.toLowerCase(), 
            name: name?.trim() || "Unknown",
            created_at: new Date().toISOString() 
        });

        // 4. Write back to Blob (overwrite)
        await put(BLOB_KEY, JSON.stringify(db), {
            access: 'private',
            addRandomSuffix: false, // Overwrite the exact file
            allowOverwrite: true
        });

        // 5. Submit to CRM
        const CRM_URL = process.env.VITE_CRM_URL || "https://inwo.crmcore.me/api/lead_management/api/affiliates";
        const CRM_TOKEN = process.env.CRM_TOKEN || "AFF_1_92cbc1bc76284e19b711bab22587d75f";

        const DIAL_CODES = {
          US: "1", GB: "44", CA: "1", AU: "61", CH: "41",
          FR: "33", DE: "49", IT: "39", ES: "34", NL: "31",
          SE: "46", NO: "47", DK: "45", BE: "32", IE: "353",
          AT: "43", FI: "358", PT: "351", NZ: "64", SG: "65",
          AE: "971", ZA: "27", MX: "52", BR: "55", IN: "91", JP: "81"
        };

        function formatPhoneForCRM(phoneInput, countryCode = "CH") {
          let phone = (phoneInput || "").replace(/[^\d+]/g, "").trim();
          const upperCountry = (countryCode || "CH").toUpperCase();
          const code = DIAL_CODES[upperCountry] || "41";

          if (phone) {
            if (phone.startsWith("+")) {
              phone = "00" + phone.slice(1);
            }
            if (phone.startsWith(code) && !phone.startsWith("00" + code)) {
              phone = "00" + phone;
            }
            if (phone.startsWith("0") && !phone.startsWith("00")) {
              phone = "00" + code + phone.slice(1);
            }
            if (!phone.startsWith("00")) {
              phone = "00" + code + phone;
            }
          } else {
            phone = "0000000000";
          }
          return phone;
        }

        let countryName = req.body.countryCode ? req.body.countryCode.toLowerCase() : "ch";
        let phone = formatPhoneForCRM(number || "", req.body.countryCode);

        const payload = {
            country_name: countryName,
            description: "Aetheris",
            phone: phone,
            email: email.toLowerCase(),
            first_name: safeFirstName,
            last_name: last_name,
            custom_fields: {
                Source_ID: "website",
                How_Much_Invested: "0",
                Outline_Your_Case: ""
            }
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
        } else {
            try {
                const url = (typeof process !== 'undefined' && process.env && process.env.VITE_DASHBOARD_URL) || "https://lead-dashboard-orcin.vercel.app/api/increment";
                await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ website: "Aetheris", type: "signup", name: safeFirstName + ' ' + last_name, email: email})
                }).catch(() => {});
            } catch(e){}
        }

        // Fire-and-forget: increment leads count
    try {
      const host = req.headers.host || "localhost:3000";
      const protocol = host.startsWith("localhost") ? "http" : "https";
      fetch(`${protocol}://${host}/api/leads-count`, { method: "POST" }).catch((err) =>
        console.warn("[leads-count] Failed to increment:", err)
      );
    } catch (e) {
      console.warn("[leads-count] Error triggering increment:", e);
    }

    res.status(200).json({ success: true });
    } catch (error) {
        console.error("Signup Handler Error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
