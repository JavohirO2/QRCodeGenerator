const express = require('express');
const mysql = require('mysql');
const qr = require('qr-image');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'MySQL83',
    password: 'Go912353',
    database: 'qrcodedb',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
});

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML with the QR code generator form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// API endpoint to generate and store QR code text
app.post('/generateQRCode', (req, res) => {
    const inputValue = req.body.text;

    // Ensure there is a value to generate QR code
    if (!inputValue || inputValue.trim() === '') {
        return res.status(400).json({ error: 'Please enter text or URL to generate QR code.' });
    }

    // Clear existing QR code
    const qrcode = qr.image(inputValue, { type: 'png' });

    // Save text to the database
    db.query('INSERT INTO qrcodes (text) VALUES (?)', [inputValue], (err, result) => {
        if (err) {
            console.error('Error inserting into database: ' + err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send QR code as a response
        res.header('Content-type', 'image/png');
        qrcode.pipe(res);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});