const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');


const app = express();


// --- MIDDLEWARE ---
app.use(cors()); // This fixes the Connection Error
app.use(bodyParser.json());


// --- 1. DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pup_registrar_db',
    port: 3307
});


db.connect(err => {
    if (err) {
        console.error('MySQL Connection Error:', err);
    } else {
        console.log('Connected to MySQL Database');
    }
});


// --- 2. EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ange.cole1917@gmail.com', // Your Email
        pass: 'dokr ozhi uzvc eqyt'      // Your App Password
    }
});


// --- API ROUTES ---
const getStatusTheme = (status) => {
    const themes = {
        'Pending':    { main: '#ca8a04', light: '#fefce8' }, // Gold
        'Processing': { main: '#a855f7', light: '#faf5ff' }, // Purple
        'For Pickup': { main: '#1e40af', light: '#eff6ff' }, // Blue
        'Completed':  { main: '#16a34a', light: '#f0fdf4' }, // Green
        'Rejected':   { main: '#dc2626', light: '#fef2f2' }, // Red
        'Default':    { main: '#800000', light: '#f9f9f9' }  // PUP Maroon
    };
    return themes[status] || themes['Default'];
};

const generateEmailHTML = (title, ref, name, service, studentId, college, program, status, theme, urgency) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: ${theme.main}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">${title}</h1>
            <p style="margin: 5px 0 0 0;">Reference: ${ref}</p>
        </div>
        <div style="padding: 20px;">
            <p>Hi <b>${name}</b>,</p>
            <div style="background: ${theme.light}; border-left: 5px solid ${theme.main}; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Request Summary</h3>
                <table style="width: 100%; font-size: 14px;">
                    <tr><td style="padding:4px 0;"><b>Service:</b></td><td>${service}</td></tr>
                    <tr><td style="padding:4px 0;"><b>Status:</b></td><td style="color: ${theme.main}; font-weight: bold;">${status}</td></tr>
                    <tr><td style="padding:4px 0;"><b>Student No:</b></td><td>${studentId}</td></tr>
                    <tr><td style="padding:4px 0;"><b>College:</b></td><td>${college}</td></tr>
                    <tr><td style="padding:4px 0;"><b>Program:</b></td><td>${program}</td></tr>
                    <tr><td style="padding:4px 0;"><b>Urgent:</b></td><td>${urgency === 'Yes' ? '🔴 Yes' : 'No'}</td></tr>
                </table>
            </div>
            <div style="text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size: 11px; color: #666; margin-bottom: 10px;">PRESENT THIS QR CODE AT THE WINDOW</p>
                <img src="cid:qrcode" style="width: 150px; height: 150px; border: 1px solid #ddd; border-radius: 5px;" />
            </div>
        </div>
    </div>
`;

// ROUTE 1: Submit Request (User Side)
app.post('/api/request', async (req, res) => {
    const { fullName, studentNumber, email, college, program, serviceCategory, specificService, isUrgent, urgencyDeadline } = req.body;

    // 1. Generate Date String (YYYYMMDD)
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
                    (now.getMonth() + 1).toString().padStart(2, '0') +
                    now.getDate().toString().padStart(2, '0');

    // 2. Count today's requests to get the next sequence number (0001, 0002...)
    const countSql = "SELECT COUNT(*) as total FROM requests WHERE reference_number LIKE ?";
    const searchPattern = `PUP-REG-${dateStr}-%`;

    db.query(countSql, [searchPattern], async (countErr, countResults) => {
        if (countErr) return res.status(500).json({ error: "Database sequence error" });

        const nextNumber = (countResults[0].total + 1).toString().padStart(4, '0');
        const referenceNumber = `PUP-REG-${dateStr}-${nextNumber}`;

        // 3. Duplicate Check: Prevent active duplicate requests for the same service
        const checkDuplicateSql = `SELECT * FROM requests WHERE student_number = ? AND specific_service = ? AND status IN ('Pending', 'Processing', 'For Pickup')`;
       
        db.query(checkDuplicateSql, [studentNumber, specificService], async (dupErr, dupResults) => {
            if (dupErr) return res.status(500).json({ error: "Duplicate check error" });
            
            if (dupResults.length > 0) {
                return res.status(400).json({ error: `You already have an active request for ${specificService}.` });
            }

            // 4. Save the Request to Database
            const sql = `INSERT INTO requests (reference_number, full_name, student_number, email, college, program, service_category, specific_service, is_urgent, urgency_deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`;
            const values = [referenceNumber, fullName, studentNumber, email, college, program, serviceCategory, specificService, isUrgent, urgencyDeadline];

            db.query(sql, values, async (err, result) => {
                if (err) {
                    console.error("Insert Error:", err);
                    return res.status(500).json({ error: "Failed to save to database" });
                }

                try {
                    // 5. Generate QR Code Base64
                    const qrCodeImage = await QRCode.toDataURL(referenceNumber);
                    const theme = getStatusTheme('Pending');

                    // 6. Send Confirmation Email
                    const mailOptions = {
                        from: '"PUP Registrar" <ange.cole1917@gmail.com>',
                        to: email,
                        subject: `Request Received - ${referenceNumber}`,
                        // Calling the 10-argument generator
                        html: generateEmailHTML("Request Confirmed", referenceNumber, fullName, specificService, studentNumber, college, program, 'Pending', theme, isUrgent),
                        attachments: [{ filename: 'qrcode.png', path: qrCodeImage, cid: 'qrcode' }]
                    };

                    transporter.sendMail(mailOptions).catch(e => console.error("Email sending failed:", e));
                   
                    // 7. Success Response to Frontend
                    res.status(200).json({
                        message: 'Success',
                        qrCode: qrCodeImage,
                        referenceNumber: referenceNumber
                    });

                } catch (qrErr) {
                    console.error("Post-save process error:", qrErr);
                    // Still return success if DB saved but QR/Email failed
                    res.status(200).json({ 
                        message: 'Success', 
                        qrCode: null, 
                        referenceNumber: referenceNumber 
                    });
                }
            });
        });
    });
});


// ROUTE 2: Track Request (User Side)
app.get('/api/track/:ref', (req, res) => {
    // .trim() removes any accidental spaces from the search
    const ref = req.params.ref.trim(); 
    const sql = "SELECT * FROM requests WHERE reference_number = ?";
   
    db.query(sql, [ref], (err, result) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        
        if (result.length === 0) {
            return res.json({ status: "Not Found" });
        }
       
        const r = result[0];
        let step = 1;
        if (r.status === 'Processing') step = 2;
        if (r.status === 'For Pickup') step = 3;
        if (r.status === 'Completed') step = 4;
        if (r.status === 'Rejected') step = 0;

        // Return the full status and the step
        return res.json({ status: r.status, step: step });
    });
});


// ROUTE 3: Get All Requests (Admin Dashboard)
app.get('/api/admin/requests', (req, res) => {
    const sql = "SELECT *, DATE_FORMAT(urgency_deadline, '%Y-%m-%d') as urgency_deadline FROM requests ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});




// ROUTE 4: Update Status (Admin Dashboard)
app.post('/api/admin/update-status', (req, res) => {
    const { id, status } = req.body;


    const getRequestSql = "SELECT * FROM requests WHERE id = ?";
   
    db.query(getRequestSql, [id], async (err, results) => {
        if (err || results.length === 0) return res.status(500).send('Error');


        const r = results[0];
        const qrCodeImage = await QRCode.toDataURL(r.reference_number);


        // HEX CODES matching your Admin Dashboard exactly
        const colors = {
            'Pending': '#ca8a04',    // Gold
            'Processing': '#a855f7', // Purple
            'For Pickup': '#1e40af', // Blue
            'Completed': '#16a34a',  // Green
            'Rejected': '#dc2626'    // Red
        };
        const activeColor = colors[status] || '#800000';


        const updateSql = "UPDATE requests SET status = ? WHERE id = ?";
        db.query(updateSql, [status, id], async (upErr) => {
            try {
                const qrCodeImage = await QRCode.toDataURL(r.reference_number); // This was missing in your screenshot!
                const theme = getStatusTheme(status);

                const mailOptions = {
                    from: '"PUP Registrar" <ange.cole1917@gmail.com>',
                    to: r.email,
                    subject: `[${status}] Request Update - ${r.reference_number}`,
                    // Ensure all 10 arguments are passed in the correct order:
                    // 1:Title, 2:Ref, 3:Name, 4:Service, 5:ID, 6:College, 7:Program, 8:Status, 9:Theme, 10:Urgency
                    html: generateEmailHTML(
                        `Status Update: ${status}`, 
                        r.reference_number, 
                        r.full_name, 
                        r.specific_service, 
                        r.student_number, 
                        r.college, 
                        r.program, 
                        status, 
                        theme, 
                        r.is_urgent // This keeps the original 'Yes' or 'No'
                    ),
                    attachments: [{ filename: 'qrcode.png', path: qrCodeImage, cid: 'qrcode' }]
                };

                await transporter.sendMail(mailOptions);
                res.status(200).send('Updated');
            } catch (e) { 
                console.error(e);
                res.status(200).send('Updated but email failed'); 
            }

        });
    });
});


// --- START SERVER ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

