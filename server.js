let fs = require('fs');
let http = require('http');
let https = require('https');
const express = require('express');
var cors = require('cors');
const app = express();
app.use(cors());
const bodyParser = require("body-parser");
var fileUpload = require('express-fileupload');
//const expressValidator = require('express-validator')
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const archiver = require('archiver');
const path = require('path');

require('dotenv').config();

// db config 🐰
require('./src/config/db');


const httpServer = http.createServer(app);
//var io = require('socket.io')(httpServer);
//var path = require("path");
app.use(bodyParser.json());
app.use(fileUpload());
//-------------------file upload ------------

//app.use(expressValidator());
//app.use('/static', express.static(path.join(__dirname, 'public')))
//socket

app.use('/', express.static(path.join(__dirname, 'public')));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
	res.json({
		status: true,
		message: 'Welcome to Auto ai module'
	})
})

var user_route = require('./src/route/user');
var customer_route = require('./src/route/customer');
var item_route = require('./src/route/item');
var shop_route = require('./src/route/shop');
var invoice_route = require('./src/route/invoice');
var purchase_route = require('./src/route/purchase');
var receipt_route = require('./src/route/receipt');
var gold_payment_route = require('./src/route/gold_payment');
var gold_receive_route = require('./src/route/gold_receive');

const port = process.env.PORT || 3000;
//const httpsPort = process.env.HTTPSPORT || 3005;
const basePath = '/api';
app.use(basePath+'/user', user_route);
app.use(basePath+'/customer', customer_route);
app.use(basePath+'/item', item_route);
app.use(basePath+'/shop', shop_route);
app.use(basePath+'/invoice', invoice_route);
app.use(basePath+'/purchase', purchase_route);
app.use(basePath+'/receipt', receipt_route);
app.use(basePath+'/goldpayment', gold_payment_route);
app.use(basePath+'/goldreceive', gold_receive_route);

// CONFIG
const MONGO_URI = process.env.MONGO_URL;
const DUMP_DIR = path.join(__dirname, 'dump');
const BACKUP_DIR = path.join(__dirname, 'backups');
const EMAIL_TO = 'rana.irfan.qau@gmail.com';

// Ensure backup folder exists
if (!fs.existsSync(DUMP_DIR)) fs.mkdirSync(DUMP_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

// Setup nodemailer (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rana.irfan.qau@gmail.com',
    pass: 'gbvs zkrq lujg aydh' // use App Password
  }
});

// API endpoint to trigger backup
app.get('/backup', async (req, res) => {
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(BACKUP_DIR, `mongo-backup-${date}.zip`);

  // Step 1: Run mongodump
  exec(`"${process.env.MONGO_TOOL_PATH}" --uri="${MONGO_URI}" --out=${DUMP_DIR}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Backup failed:', stderr);
      return res.status(500).send('Backup failed');
    }

    // Step 2: Compress folder
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async () => {
      console.log(`Backup created: ${archivePath} (${archive.pointer()} bytes)`);
		// Step 3: Clean old backups, keep latest 3
		let files = fs.readdirSync(BACKUP_DIR)
			.filter(f => f.endsWith('.zip'))
			.map(f => ({
			name: f,
			time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
			}))
			.sort((a, b) => b.time - a.time); // newest first

		if (files.length > 3) {
			const toDelete = files.slice(3);
			toDelete.forEach(f => {
			fs.unlinkSync(path.join(BACKUP_DIR, f.name));
			console.log('Deleted old backup:', f.name);
			});
		}
      // Step 3: Send email
      try {
		// Step 5: Remove temporary dump folder
        if (fs.existsSync(DUMP_DIR)) {
			fs.rmSync(DUMP_DIR, { recursive: true, force: true });
			console.log('Removed temporary dump folder');
		  }
        await transporter.sendMail({
          from: '"Mongo Backup" <your@gmail.com>',
          to: EMAIL_TO,
          subject: 'MongoDB Backup',
          text: 'Backup attached.',
          attachments: [
            { filename: path.basename(archivePath), path: archivePath }
          ]
        });
        res.send('Backup created and emailed successfully!');
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
        res.status(500).send('Backup created but email failed');
      }
    });

    archive.on('error', err => {
      console.error('Compression error:', err);
      res.status(500).send('Compression failed');
    });

    archive.pipe(output);
    archive.directory(DUMP_DIR, false);
    archive.finalize();
  });
});

httpServer.listen(port, () => console.log(`Gold shop App listening on port ${port}!`))
//httpsServer.listen(httpsPort, () => console.log(`Example app listening on port ${httpsPort}!`));
//console.log(httpServer)
exports.httpServer = httpServer
