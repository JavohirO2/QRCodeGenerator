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

//Middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Database connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

app.post('/saveQrCode', async (req, res) => {
    await poolConnect;
    const { data, linkDescription,} = req.body;
    console.log("app.post Data and Description", data, linkDescription)
    
    const request = pool.request();
    request.input('data', sql.NVarChar, data);
    request.input('linkDescription', sql.NVarChar, linkDescription);
    const result = await request.query('INSERT INTO qrcode (link, linkDescription, createdate) VALUES (@data, @linkDescription, GETDATE())'); 
  });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});