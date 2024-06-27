const bcrypt = require('bcryptjs');

/** 
* Validates the new password based on the criteria.
* @param {string} newPassword = The new password to validate.
* @param {string} confirmPassword - The confirmation of the new password.
* @param {string} currentPassword = The current password of the user.
* @param {Array<string>} previousPasswords = An array of previously used passwords.
* @returns {Promise<string|null>} - Returns an error message if validation fails, otherwise null.
*/

exports.validatePassword = async (newPassword, confirmPassword, currentPassword, previousPasswords) => {
    if (newPassword !== confirmPassword) {
        return 'Passwords do not match';
    }

    if (await bcrypt.compare(newPassword, currentPassword)) {
        return 'New password must not be the same as a previous password';
    }

    // Check if new password is same as any of the previous passwords
    const isSameAsPrevious = await Promise.all(previousPasswords.map(async (hash) => { // Use Promise.all with map to handle asynchronous comparisons in parallel.
        return await bcrypt.compare(newPassword, hash);
    }));

    if (isSameAsPrevious.includes(true)) {
        return 'New password cannot be the same as a previously used password';
    }

    return null;
};



