const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 5173;

const config = {
    user: 'qrCodeUser',
    password:'Pa$$w0rd12345',
    server:'T-SCOR-MS-DB90',
    database:'QrCodeGenerator',
    options:{
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

// API request to check if data exists
app.post('/checkDuplicate', async (req, res) => {
    await poolConnect;
    const { data } = req.body;

    const request = pool.request();
    request.input('data', sql.NVarChar, data);
    const result = await request.query('SELECT * FROM qrcode WHERE link = @data');

    if (result.recordset.length > 0) {
        res.json({ exists: true, message: "Data already exists" });
    } else {
        res.json({ exists: false, message: "Data does not exist" });
    }
});

// API request to modify existing data
app.put('/updateQrCode/:id', async (req, res) => {
    await poolConnect;
    const { id } = req.params;
    const { data, linkDescription } = req.body;

    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('data', sql.NVarChar, data);
    request.input('linkDescription', sql.NVarChar, linkDescription);
    const result = await request.query('UPDATE qrcode SET link = @data, linkDescription = @linkDescription WHERE id = @id');

    if (result.rowsAffected[0] > 0) {
        res.json({ success: true, message: "Data updated successfully" });
    } else {
        res.json({ success: false, message: "Failed to update data" });
    }
});

// API request to pull data for combobox
app.get('/getQrCodes', async (req, res) => {
    await poolConnect;

    const request = pool.request();
    const result = await request.query('SELECT id, link, linkDescription FROM qrcode');

    res.json(result.recordset);
});

// Existing saveQrCode API
app.post('/saveQrCode', async (req, res) => {
    await poolConnect;
    const { data, linkDescription } = req.body;
    console.log("app.post Data and Description", data, linkDescription);
    
    const request = pool.request();
    request.input('data', sql.NVarChar, data);
    request.input('linkDescription', sql.NVarChar, linkDescription);
    const result = await request.query('INSERT INTO qrcode (link, linkDescription, createdate) VALUES (@data, @linkDescription, GETDATE())'); 

    res.json({ success: true, message: "QR Code saved successfully" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
