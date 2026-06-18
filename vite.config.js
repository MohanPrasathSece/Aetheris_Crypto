import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-plugin-local-api',
      configureServer(server) {
        let mockUsersDb = { users: [] }; // In-memory mock DB for local dev

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
                    if (mockUsersDb.users.find(u => u.email === data.email)) {
                        res.statusCode = 400;
                        return res.end(JSON.stringify({ error: 'Email already registered in the Node Network.' }));
                    }
                    mockUsersDb.users.push({ email: data.email, name: `${data.first_name} ${data.last_name}` });
                    res.statusCode = 200;
                    return res.end(JSON.stringify({ success: true }));
                  } 
                  
                  else if (req.url === '/api/auth-login') {
                    const user = mockUsersDb.users.find(u => u.email === data.email);
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
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Server error' }));
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
})
