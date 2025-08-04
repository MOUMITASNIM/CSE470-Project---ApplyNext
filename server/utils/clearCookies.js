// Clear auth cookies
const clearTokenCookies = (res) => {
    // Clear user token
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    // Clear admin token
    res.cookie('adminToken', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

module.exports = clearTokenCookies;
