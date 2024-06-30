const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // CREATE A TRANSPORTER (a service that will send the email)
        const transporter = nodemailer.createTransport({
            host: process.env.NODE_ENV === 'development' ? process.env.DEV_EMAIL_HOST : process.env.PROD_EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.NODE_ENV === 'development' ? process.env.DEV_EMAIL_USER : process.env.PROD_EMAIL_USER,
                pass: process.env.NODE_ENV === 'development' ? process.env.DEV_EMAIL_PASSWORD : process.env.PROD_EMAIL_PASSWORD
            }
        });

        //DEFINE EMAIL OPTIONS  
        const emailOptions = {
            from: 'Cardinal Finds support<support@cardinalfinds.com>',
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
