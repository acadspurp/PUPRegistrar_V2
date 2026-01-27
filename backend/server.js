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
    database: 'pup_registrar_db'
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

// ROUTE 1: Submit Request (User Side)
app.post('/api/request', async (req, res) => {
    const { referenceNumber, fullName, studentNumber, email, college, program, serviceCategory, specificService, isUrgent, urgencyDeadline } = req.body;

    const sql = `INSERT INTO requests (reference_number, full_name, student_number, email, college, program, service_category, specific_service, is_urgent, urgency_deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [referenceNumber, fullName, studentNumber, email, college, program, serviceCategory, specificService, isUrgent, urgencyDeadline];

    db.query(sql, values, async (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database Error');
        } else {
            // Generate QR Code and Send Email
            try {
                const qrCodeImage = await QRCode.toDataURL(referenceNumber);
                
                const mailOptions = {
                    from: '"PUP Registrar" <ange.cole1917@gmail.com>',
                    to: email,
                    subject: `Request Confirmation - ${referenceNumber}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px;">
                            <h2 style="color: #800000;">PUP Registrar Request Received</h2>
                            <p>Hi <strong>${fullName}</strong>,</p>
                            <p>Your request has been successfully recorded.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 5px solid #800000;">
                                <p><strong>Reference Number:</strong> ${referenceNumber}</p>
                                <p><strong>Status:</strong> Pending</p>
                            </div>

                            <p>Please save the QR Code below. You may need to present this at the Registrar's Office.</p>
                            <div style="text-align: center; margin-top: 20px;">
                                <img src="cid:unique-qrcode-id" alt="QR Code" style="width: 200px; height: 200px;"/>
                            </div>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: 'qrcode.png',
                            path: qrCodeImage,
                            cid: 'unique-qrcode-id'
                        }
                    ]
                };

                await transporter.sendMail(mailOptions);
                console.log(`Confirmation email sent to ${email}`);
                res.status(200).send('Request saved and email sent');

            } catch (emailError) {
                console.error('Email Error:', emailError);
                // We send 200 because the Data was saved, even if email failed
                res.status(200).send('Request saved but email failed'); 
            }
        }
    });
});

// ROUTE 2: Track Request (User Side)
app.get('/api/track/:ref', (req, res) => {
    const ref = req.params.ref;
    const sql = "SELECT * FROM requests WHERE reference_number = ?";
    
    db.query(sql, [ref], (err, result) => {
        if (err) return res.json({ error: "DB Error" });
        if (result.length === 0) return res.json({ status: "Not Found" });
        
        // Map text status to visual step number
        let step = 1;
        const status = result[0].status;
        if (status === 'Processing') step = 2;
        if (status === 'For Pickup') step = 3;
        if (status === 'Completed') step = 4;
        if (status === 'Rejected') step = 0;

        return res.json({ status: status, step: step });
    });
});

// ROUTE 3: Get All Requests (Admin Dashboard)
app.get('/api/admin/requests', (req, res) => {
    const sql = "SELECT * FROM requests ORDER BY created_at DESC";
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

    // 1. Get student details first to send email
    const getRequestSql = "SELECT * FROM requests WHERE id = ?";
    
    db.query(getRequestSql, [id], (err, results) => {
        if (err || results.length === 0) {
            console.error(err);
            return res.status(500).send('Error fetching request details');
        }

        const requestData = results[0];
        const studentEmail = requestData.email;
        const refNum = requestData.reference_number;
        const fullName = requestData.full_name;

        // 2. Update the database
        const updateSql = "UPDATE requests SET status = ? WHERE id = ?";
        
        db.query(updateSql, [status, id], async (updateErr, updateResult) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send('Error updating status');
            }

            // 3. Send Notification Email
            try {
                let subjectLine = `Update on Request - ${refNum}`;
                let messageBody = `Your request status has been updated to: <strong>${status}</strong>.`;
                let color = "#800000"; // Maroon

                if (status === 'For Pickup') {
                    subjectLine = `Action Required: Document Ready - ${refNum}`;
                    messageBody = `Good news! Your requested document is now <strong>Ready for Pickup</strong>. Please visit the Registrar's Office.`;
                    color = "#28a745"; // Green
                } else if (status === 'Rejected') {
                    subjectLine = `Update on Request - ${refNum}`;
                    messageBody = `We regret to inform you that your request has been <strong>Rejected</strong>. Please contact the office.`;
                    color = "#dc3545"; // Red
                } else if (status === 'Completed') {
                    subjectLine = `Request Completed - ${refNum}`;
                    messageBody = `Your transaction has been successfully <strong>Completed</strong>. Thank you!`;
                    color = "#007bff"; // Blue
                }

                const mailOptions = {
                    from: '"PUP Registrar" <ange.cole1917@gmail.com>',
                    to: studentEmail,
                    subject: subjectLine,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px;">
                            <h2 style="color: ${color};">${subjectLine}</h2>
                            <p>Hi <strong>${fullName}</strong>,</p>
                            <p>${messageBody}</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 5px solid ${color};">
                                <p><strong>Reference Number:</strong> ${refNum}</p>
                                <p><strong>New Status:</strong> ${status}</p>
                            </div>

                            <p style="font-size: 12px; color: #666;">This is an automated message.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Status update sent to ${studentEmail}`);
                res.status(200).send('Status updated and email sent');

            } catch (emailError) {
                console.error('Email Error:', emailError);
                res.status(200).send('Status updated but email failed');
            }
        });
    });
});

// --- START SERVER ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});