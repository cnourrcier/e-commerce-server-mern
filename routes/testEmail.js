const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

router.get('/test-email', async (req, res) => {
    try {
        const testEmailOptions = {
            email: 'your-email@example.com',
            subject: 'Test Email',
            message: 'This is a test email.'
        };

        await sendEmail(testEmailOptions);
        res.status(200).json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ success: false, message: 'Test email failed' });
    }
});

module.exports = router;
