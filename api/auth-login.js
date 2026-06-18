import { get } from '@vercel/blob';

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

        return res.status(200).json({ success: true, user: { email: user.email, name: user.name } });
    } catch (error) {
        console.error("Login Handler Error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
