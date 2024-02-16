const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;
    if(url === '/') {
        res.setHeader('Content-Type','text/html');
        res.write('<html>');
        res.write('<head><title>Enter message</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" placeholder="Enter somthing"  name="message"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        return res.end();
    }
    if(url === '/message' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });
        return req.on('end', () => {
            const parseBody = Buffer.concat(body).toString();
            let message = parseBody.split("=")[1];
            message = message.replaceAll("+", " ");
            fs.appendFile('message.txt', `${message}\n`, err => {
                res.statusCode = 304;
                res.setHeader('Location', '/');
                return res.end();
            });
        })
    }
    res.setHeader('Content-Type','text/html');
    res.write('<html>');
    res.write('<head><title>Hello</title></head>');
    res.write('<body><h1>HELLO WORLD!</h1></body>');
    res.write('</html>');
    res.end();
}

module.exports = requestHandler;