const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
    user: 'qrCodeUser',
    password: 'Pa$$w0rd12345',
    server: 'T-SCOR-MS-DB90',
    database: 'QrCodeGenerator',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// Route to shorten url
app.post('/shorten', async (req, res) => {
    await poolConnect; // ensure the pool is connected

    const { originalUrl } = req.body;
    console.log("🚀 ~ app.post ~ originalUrl:", originalUrl);

    // Generate a unique shortcode
    const shortCode = generateShortCode();

    // Insert the mapping into the database
    const request = pool.request();
    const shortenedUrl = `https://dev-s.trihealth.com/${shortCode}`;
    request.input('originalUrl', sql.NVarChar, originalUrl);
    request.input('shortCode', sql.NVarChar, shortCode);
    await request.query('INSERT INTO urlshortner (originalUrl, shortCode, createdate, accessCount) VALUES (@originalUrl, @shortCode, GETDATE(), 0)');

    res.json({ originalUrl, shortenedUrl });
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:shortCode', async (req, res) => {
    await poolConnect;

    const { shortCode } = req.params;
    console.log("🚀 ~ app.get ~ shortCode:", shortCode);

    const request = pool.request();
    request.input('shortCode', sql.NVarChar, shortCode);
    request.output('originalUrl', sql.NVarChar);

    const result = await request.execute('GetOriginalUrlAndUpdateCount');

    if (result.output.originalUrl) {
        const originalUrl = result.output.originalUrl;
        console.log("🚀 ~ app.get ~ result:", result);

        res.status(301).redirect(originalUrl);
    } else {
        res.status(404).send('URL not found');
        console.log('else statement is being called on');
    }
});

app.get('/data', async (req, res) => {
    await poolConnect; // ensure the pool is connected
    try {
        const request = pool.request();
        const result = await request.query('SELECT urlshortnerId, originalUrl, shortCode, accessCount FROM urlshortner');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

function generateShortCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';
    for (let i = 0; i < 6; i++) {
        shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return shortCode;
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Route to check if the original URL already exists
app.post('/exists', async (req, res) => {
    await poolConnect; // ensure the pool is connected

    const { originalUrl } = req.body;
    console.log("🚀 ~ app.post ~ originalUrl:", originalUrl);

    const request = pool.request();
    request.input('originalUrl', sql.NVarChar, originalUrl);
    const result = await request.query('SELECT originalUrl FROM urlshortner WHERE originalUrl = @originalUrl');

    if (result.recordset.length > 0) {
        // If the URL already exists, send back a response indicating it exists
        res.json({ exists: true });
    } else {
        // If the URL does not exist, send back a response indicating it does not exist
        res.json({ exists: false });
    }
});
