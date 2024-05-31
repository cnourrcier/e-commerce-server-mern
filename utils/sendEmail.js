const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // CREATE A TRANSPORTER (a service that will send the email)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    //DEFINE EMAIL OPTIONS  
    const emailOptions = {
        from: 'Cardinal Nest Treasures support<support@cardinalnesttreasures.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    // SEND EMAIL
    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;
