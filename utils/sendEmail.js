const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log(options);
    try {
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
            from: 'Cardinal Goods support<support@cardinalgoods.com>',
            to: options.email,
            subject: options.subject,
            text: options.message
        }
        // SEND EMAIL
        await transporter.sendMail(emailOptions);
    } catch (err) {
        console.error('Error sending email:', err);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
