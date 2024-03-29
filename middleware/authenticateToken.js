const jwt = require('jsonwebtoken');
const secretToken = "tecweb2223";
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        req.isAuthenticated = false;
        next();
    } else {

        jwt.verify(token.replace('Bearer ', ''), secretToken, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }
            console.log("AuthenticateToken:", user)
            req.isAuthenticated = true;
            req.user = user;
            next();
        });
    }
}

function getCurrentUserFromToken(token) {
    const decoded = jwt.verify(token.replace('Bearer ', ''), secretToken);
    const currentUser = decoded.usernsame;
    return decoded;
}
module.exports = { authenticateToken, secretToken, getCurrentUserFromToken };
// module.exports = secretToken;
