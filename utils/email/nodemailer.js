const nodemailer = require("nodemailer");

// Create a transporter object
let transporter = nodemailer.createTransport({
    host: 'az1-ts111.a2hosting.com',
    port: 465,
    secure: true,
    auth: {
        user: "cosmatest@timeengcom.com", // Your email address
        pass: "24682468", // Your email password
    },
});

// Setup email data



module.exports = transporter;