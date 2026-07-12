export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const CRM_URL = process.env.VITE_CRM_URL || "https://inwo.crmcore.me/api/lead_management/api/affiliates";

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
    const CRM_TOKEN = process.env.CRM_TOKEN || "AFF_1_92cbc1bc76284e19b711bab22587d75f";

    try {
        const leadData = req.body;

        const [first_name, ...lastNameParts] = (leadData.name || leadData.first_name || "Unknown").trim().split(" ");
        const safeFirstName = first_name || "User";
        const last_name = lastNameParts.length > 0 ? lastNameParts.join(" ") : "Lead";
        const email = leadData.email?.includes("@") ? leadData.email : `user${Math.floor(Math.random()*10000)}@example.com`;
        
        const message = leadData.message || leadData.description;
        const description = message || "Signup Lead";

        let countryName = leadData.countryCode ? leadData.countryCode.toLowerCase() : "ch";
        let phone = formatPhoneForCRM(leadData.number || leadData.phone || "", leadData.countryCode);

        const payload = {
            country_name: countryName,
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
            const url = (typeof process !== 'undefined' && process.env && process.env.VITE_DASHBOARD_URL) || "https://lead-dashboard-orcin.vercel.app/api/increment";
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
