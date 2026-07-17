import { get, head } from '@vercel/blob';

const BLOB_KEY = 'aetheris_users_v2.json';

// Helper to fetch the current users DB from Blob
async function getUsersDB() {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    try {
        let blobMeta;
        try {
            blobMeta = await head(BLOB_KEY, { token });
        } catch (e) {
            return { users: [] };
        }
        
        if (blobMeta && blobMeta.url) {
            const result = await get(blobMeta.url, { access: 'public', token });
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
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // 1. Read Blob DB
        const db = await getUsersDB();

        // 2. Check if user exists
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials. Node access denied.' });
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

        res.status(200).json({ success: true, user: { email: user.email, name: user.name } });
    } catch (error) {
        console.error("Login Handler Error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
