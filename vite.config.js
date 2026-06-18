import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { put, get } from '@vercel/blob'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
const token = process.env.BLOB_READ_WRITE_TOKEN;

async function getUsersDB(token) {
    try {
        const result = await get('users.json', { access: 'private', token });
        return await new Response(result.stream).json();
    } catch (error) {
        console.error("Error reading Blob DB locally:", error);
        return { users: [] };
    }
}

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
      {
        name: 'vite-plugin-local-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url.startsWith('/api/')) {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', async () => {
                if (req.method === 'POST') {
                  try {
                    const data = JSON.parse(body || '{}');
                    res.setHeader('Content-Type', 'application/json');
                    
                    if (req.url === '/api/auth-signup') {
                      const db = await getUsersDB(token);
                      if (db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
                          res.statusCode = 400;
                          return res.end(JSON.stringify({ error: 'Email already registered in the Node Network.' }));
                      }
                      
                      db.users.push({ 
                          email: data.email.toLowerCase(), 
                          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                          created_at: new Date().toISOString()
                      });
                      
                      await put('users.json', JSON.stringify(db), {
                          access: 'private',
                          addRandomSuffix: false,
                          allowOverwrite: true,
                          token: token
                      });

                      res.statusCode = 200;
                      return res.end(JSON.stringify({ success: true }));
                    } 
                    
                    else if (req.url === '/api/auth-login') {
                      const db = await getUsersDB(token);
                      const user = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
                      if (!user) {
                          res.statusCode = 401;
                          return res.end(JSON.stringify({ error: 'Invalid credentials. Node access denied.' }));
                      }
                      res.statusCode = 200;
                      return res.end(JSON.stringify({ success: true, user }));
                    }

                    else if (req.url === '/api/affiliates') {
                      res.statusCode = 200;
                      return res.end(JSON.stringify({ success: true, message: "Local mock success" }));
                    }

                    res.statusCode = 404;
                    return res.end(JSON.stringify({ error: 'Not found' }));
                  } catch(e) {
                    console.error("Local API Error:", e);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Server error', details: e.message }));
                  }
                } else {
                  res.statusCode = 405;
                  res.end(JSON.stringify({ error: 'Method not allowed' }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
  }
})
